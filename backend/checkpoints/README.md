# Checkpoints

Place your trained recognition assets in this directory.

Expected files:

- `model.pth` - PyTorch checkpoint or weights file
- `labels.json` - Ordered list of label names or a JSON object with a `labels` field
- `config.yaml` - Optional runtime metadata such as `sequence_length`, `confidence_threshold`, and `input_size`

The backend automatically detects these files at startup when `MODEL_PATH`, `LABEL_PATH`, or `CONFIG_PATH` are not set in the environment.

Example environment values:

```bash
MODEL_PATH=
LABEL_PATH=
DEVICE=cpu
SEQUENCE_LENGTH=32
CONFIDENCE_THRESHOLD=0.6
```