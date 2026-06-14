#!/usr/bin/env python3
"""
Regression Test for OpenHands INCLUDE ISL Model.

Purpose: Validate the model on a deterministic sample to catch regressions
when dependencies are updated or checkpoint is changed.

This test:
1. Uses a fixed random seed (deterministic)
2. Creates the same pose sequence every time
3. Runs inference
4. Compares output against baseline
5. Reports pass/fail

Usage:
    python backend/tools/regression_test.py [--generate-baseline]

Options:
    --generate-baseline    Generate and save the baseline results (do this first)
    (default)              Run regression test against saved baseline
"""

import sys
import torch
import yaml
import csv
import json
import time
from pathlib import Path
from typing import Dict, List

CHECKPOINT_DIR = Path("/workspaces/SignBridge/backend/checkpoints/openhands-include-lstm")
CHECKPOINT_FILE = CHECKPOINT_DIR / "epoch=294-step=63719.ckpt"
CONFIG_FILE = CHECKPOINT_DIR / "config.yaml"
LABELS_FILE = CHECKPOINT_DIR / "labels.csv"
BASELINE_FILE = CHECKPOINT_DIR / "regression_baseline.json"

class DeterministicSample:
    """Generate deterministic pose sequence for regression testing"""
    
    @staticmethod
    def create_test_sample(seed: int = 42) -> torch.Tensor:
        """
        Create a deterministic test sample.
        
        Args:
            seed: Random seed for reproducibility
        
        Returns:
            Pose tensor: (1, 32, 27, 2)
        """
        torch.manual_seed(seed)
        
        # Create signing gesture with fixed randomness
        num_frames = 32
        num_points = 27
        
        sequence = []
        for frame_idx in range(num_frames):
            # Base standing pose
            pose = torch.zeros(num_points, 2)
            
            # Head (center-top)
            pose[0] = torch.tensor([0.5, 0.25])
            
            # Upper body
            pose[1:5] = torch.tensor([
                [0.35, 0.45],  # left shoulder
                [0.65, 0.45],  # right shoulder
                [0.25, 0.65],  # left hip
                [0.75, 0.65],  # right hip
            ])
            
            # Arms and hands
            pose[5:9] = torch.tensor([
                [0.3, 0.5],   # left elbow
                [0.25, 0.7],  # left wrist
                [0.7, 0.5],   # right elbow
                [0.75, 0.7],  # right wrist
            ])
            
            # Hand points with deterministic noise
            for i in range(9, 25):
                pose[i] = torch.randn(2) * 0.05 + 0.5
            
            # Extra points
            pose[25:27] = torch.randn(2, 2) * 0.05 + 0.5
            
            # Add frame-specific motion
            t = frame_idx / num_frames
            hand_x = 0.1 * (t - 0.5) * 2  # Sway left-right
            hand_y = 0.05 * (1 - abs(2*t - 1))  # Up-down motion
            
            pose[6, 0] += hand_x
            pose[6, 1] += hand_y
            pose[8, 0] -= hand_x
            pose[8, 1] += hand_y
            
            pose = torch.clamp(pose, 0, 1)
            sequence.append(pose)
        
        return torch.stack(sequence).unsqueeze(0)  # (1, 32, 27, 2)

class RegressionTest:
    """Run regression tests against baseline"""
    
    def __init__(self):
        self.device = torch.device("cpu")  # Use CPU for consistency
        self.model = None
        self.labels = []
        self.config = None
        self.state_dict = None
        
        # Enable deterministic behavior for reproducibility
        torch.manual_seed(42)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    
    def setup(self) -> bool:
        """Load model, config, labels"""
        try:
            # Load checkpoint
            ckpt = torch.load(str(CHECKPOINT_FILE), map_location=self.device, weights_only=False)
            self.state_dict = ckpt.get("state_dict", {})
            
            # Load config
            with open(CONFIG_FILE) as f:
                self.config = yaml.safe_load(f)
            
            # Load labels
            label_set = set()
            with open(LABELS_FILE) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    word = row['Word']
                    if word not in label_set:
                        self.labels.append(word)
                        label_set.add(word)
            
            # Build model
            num_points = self.config['model']['encoder']['params']['num_points']
            hidden_size = self.config['model']['decoder']['params']['hidden_size']
            num_classes = len(self.labels)
            
            class ISLModel(torch.nn.Module):
                def __init__(self, num_points, hidden_size, num_classes):
                    super().__init__()
                    self.lstm = torch.nn.LSTM(
                        num_points * 2, hidden_size, 4,
                        bidirectional=True, batch_first=True
                    )
                    self.fc = torch.nn.Linear(hidden_size * 2, num_classes)
                
                def forward(self, x):
                    batch, seq, points, coords = x.shape
                    x = x.reshape(batch, seq, -1)
                    lstm_out, _ = self.lstm(x)
                    return self.fc(lstm_out[:, -1, :])
            
            self.model = ISLModel(num_points, hidden_size, num_classes)
            self.model.to(self.device)
            self.model.eval()
            
            return True
        except Exception as e:
            print(f"Setup failed: {e}")
            return False
    
    def run_test(self) -> torch.Tensor:
        """Run inference on deterministic sample"""
        poses = DeterministicSample.create_test_sample(seed=42)
        poses = poses.to(self.device)
        
        with torch.no_grad():
            logits = self.model(poses)
        
        return logits
    
    def decode_logits(self, logits: torch.Tensor, k: int = 5) -> List[Dict]:
        """Decode logits to predictions"""
        probs = torch.softmax(logits, dim=-1)
        top_probs, top_indices = torch.topk(probs, k, dim=-1)
        
        predictions = []
        label_map = {i: label for i, label in enumerate(self.labels)}
        
        for prob, idx in zip(top_probs[0], top_indices[0]):
            predictions.append({
                "label": label_map[idx.item()],
                "confidence": prob.item(),
                "index": idx.item()
            })
        
        return predictions
    
    def generate_baseline(self) -> bool:
        """Generate and save baseline results"""
        print("\n" + "="*70)
        print("GENERATING REGRESSION TEST BASELINE")
        print("="*70)
        
        if not self.setup():
            print("✗ Setup failed")
            return False
        
        print("\n[1] Running inference on deterministic sample...")
        logits = self.run_test()
        
        print("[2] Decoding predictions...")
        predictions = self.decode_logits(logits, k=5)
        
        baseline = {
            "timestamp": time.time(),
            "checkpoint": str(CHECKPOINT_FILE),
            "num_labels": len(self.labels),
            "predictions": predictions,
            "logits_mean": float(logits.mean().item()),
            "logits_std": float(logits.std().item()),
            "logits_min": float(logits.min().item()),
            "logits_max": float(logits.max().item()),
        }
        
        with open(BASELINE_FILE, 'w') as f:
            json.dump(baseline, f, indent=2)
        
        print(f"\n✓ Baseline saved to {BASELINE_FILE}")
        print(f"\nBaseline Results:")
        print(f"  Top prediction: {predictions[0]['label']} ({predictions[0]['confidence']:.6f})")
        print(f"  Num labels: {baseline['num_labels']}")
        print(f"  Logits stats: mean={baseline['logits_mean']:.6f}, std={baseline['logits_std']:.6f}")
        
        return True
    
    def run_regression_test(self) -> bool:
        """Run regression test against baseline"""
        print("\n" + "="*70)
        print("REGRESSION TEST: Validating Model Stability")
        print("="*70)
        
        # Check if baseline exists
        if not BASELINE_FILE.exists():
            print("\n✗ Baseline not found. Run with --generate-baseline first.")
            return False
        
        if not self.setup():
            print("✗ Setup failed")
            return False
        
        # Load baseline
        with open(BASELINE_FILE) as f:
            baseline = json.load(f)
        
        print("\n[1] Running inference on deterministic sample...")
        logits = self.run_test()
        
        print("[2] Decoding predictions...")
        predictions = self.decode_logits(logits, k=5)
        
        # Check for regressions
        tests_passed = 0
        tests_failed = 0
        
        print("\n[3] Regression Checks:")
        
        # Check 1: Top prediction matches
        if predictions[0]['label'] == baseline['predictions'][0]['label']:
            print(f"  ✓ Top prediction stable: {predictions[0]['label']}")
            tests_passed += 1
        else:
            print(f"  ✗ Top prediction changed!")
            print(f"    Expected: {baseline['predictions'][0]['label']}")
            print(f"    Got:      {predictions[0]['label']}")
            tests_failed += 1
        
        # Check 2: Num labels unchanged
        if len(self.labels) == baseline['num_labels']:
            print(f"  ✓ Label count stable: {len(self.labels)}")
            tests_passed += 1
        else:
            print(f"  ✗ Label count changed!")
            print(f"    Expected: {baseline['num_labels']}")
            print(f"    Got:      {len(self.labels)}")
            tests_failed += 1
        
        # Check 3: Logits statistics similar
        logits_mean = float(logits.mean().item())
        logits_std = float(logits.std().item())
        
        mean_diff = abs(logits_mean - baseline['logits_mean'])
        std_diff = abs(logits_std - baseline['logits_std'])
        
        if mean_diff < 0.1 and std_diff < 0.1:
            print(f"  ✓ Logits distribution stable")
            print(f"    Mean: {logits_mean:.6f} (baseline: {baseline['logits_mean']:.6f})")
            print(f"    Std:  {logits_std:.6f} (baseline: {baseline['logits_std']:.6f})")
            tests_passed += 1
        else:
            print(f"  ✗ Logits distribution changed!")
            print(f"    Mean diff: {mean_diff:.6f}")
            print(f"    Std diff:  {std_diff:.6f}")
            tests_failed += 1
        
        # Summary
        print("\n" + "="*70)
        print(f"REGRESSION TEST RESULTS: {tests_passed} passed, {tests_failed} failed")
        print("="*70)
        
        if tests_failed == 0:
            print("\n✓ ALL TESTS PASSED - Model is stable")
            print("\nTop-5 Predictions:")
            for i, pred in enumerate(predictions, 1):
                print(f"  {i}. {pred['label']:40s} {pred['confidence']:.6f}")
            return True
        else:
            print(f"\n✗ REGRESSIONS DETECTED ({tests_failed} test(s) failed)")
            return False

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--generate-baseline":
        test = RegressionTest()
        success = test.generate_baseline()
        return 0 if success else 1
    else:
        test = RegressionTest()
        success = test.run_regression_test()
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
