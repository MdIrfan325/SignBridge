"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";
import { useSignRecognition } from "@/hooks/useSignRecognition";
import { useSignRecognitionDebug } from "@/hooks/useSignRecognitionDebug";
import { getRecognitionRuntime, type RecognitionResult } from "@/lib/recognition-service";
import { RecognitionDiagnostics } from "@/components/recognition-diagnostics";
import type { SignLanguageKey } from "@/lib/sign-data";

interface SignRecognitionPanelProps {
  language: SignLanguageKey;
  onRecognitionResult?: (text: string, confidence: number) => void;
  onStatusChange?: (status: "idle" | "initializing" | "recognizing" | "error") => void;
  debug?: boolean;
}

export function SignRecognitionPanel({ language, onRecognitionResult, onStatusChange, debug = false }: SignRecognitionPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Use debug hook if enabled, otherwise use standard hook
  const debugState = useSignRecognitionDebug({
    language,
    debug,
    onResult: (result) => {
      onRecognitionResult?.(result.text, result.confidence);
    },
    onError: (err) => {
      console.error("Recognition error:", err);
    },
  });

  const standardState = useSignRecognition({
    language,
    onResult: (result: RecognitionResult) => {
      onRecognitionResult?.(result.text, result.confidence);
    },
    onError: (err) => {
      console.error("Recognition error:", err);
    },
  });

  const state = debug ? debugState : standardState;
  const { isInitialized, isRecognizing, results, confidence, error, startRecognition, stopRecognition, clearResults } = state;

  // Extract metrics from first result if in debug mode
  const latestResult = results[0] as any;
  const latencyMs = latestResult?.latencyMs || null;
  const modelName = latestResult?.model || null;
  const metricsCollector = debug ? (state as any).metricsCollector : null;
  const fps = debug ? (state as any).fps || 0 : 0;
  const requestInFlight = debug ? (state as any).requestInFlight || false : false;
  const droppedFrames = debug ? (state as any).droppedFrames || 0 : 0;
  const sequenceLength = latestResult?.sequenceLength || null;
  const apiVersion = latestResult?.api_version || "1.0";

  const currentStatus: "idle" | "initializing" | "recognizing" | "error" = error
    ? "error"
    : !isInitialized
      ? "initializing"
      : isRecognizing
        ? "recognizing"
        : "idle";

  useEffect(() => {
    onStatusChange?.(currentStatus);
  }, [currentStatus, onStatusChange]);

  useEffect(() => {
    return () => {
      stopRecognition();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [stopRecognition]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
      return true;
    } catch (cameraError) {
      console.error("Camera error:", cameraError);
      return false;
    }
  };

  const stopCamera = () => {
    stopRecognition();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    clearResults();
  };

  const handleRecognitionToggle = async () => {
    if (!cameraActive) {
      const started = await startCamera();
      if (!started || !videoRef.current) {
        return;
      }
      await startRecognition(videoRef.current);
      return;
    }

    if (isRecognizing) {
      stopRecognition();
      return;
    }

    if (videoRef.current) {
      await startRecognition(videoRef.current);
    }
  };

  const runtime = getRecognitionRuntime();

  return (
    <div className="w-full space-y-6 rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-sm dark:border-teal-900/40 dark:bg-slate-900/80">
      <div>
        <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">📹 Live Camera Recognition</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This mode recognizes signs from your camera in real-time. Make a sign after starting the camera.
        </p>
      </div>

      {/* Step-by-step instructions */}
      {!cameraActive && (
        <div className="rounded-xl bg-teal-50 px-4 py-3 dark:bg-teal-500/10">
          <p className="text-sm font-bold text-teal-900 dark:text-teal-200">👉 How to use:</p>
          <ol className="mt-2 space-y-1 text-sm text-teal-800 dark:text-teal-300">
            <li>1. Click <strong>"Start Camera"</strong> to enable your webcam</li>
            <li>2. Click <strong>"Start Recognition"</strong> to begin detecting signs</li>
            <li>3. Make a sign in front of the camera</li>
          </ol>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full ${
            currentStatus === "recognizing"
              ? "bg-emerald-500 animate-pulse"
              : currentStatus === "error"
                ? "bg-rose-500"
                : currentStatus === "initializing"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-slate-400"
          }`}
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {currentStatus === "recognizing" && "✓ Recognizing..."}
          {currentStatus === "initializing" && "⏳ Initializing backend..."}
          {currentStatus === "error" && "❌ Recognition error"}
          {currentStatus === "idle" && "✓ Ready"}
        </span>
      </div>

      <div className="aspect-video overflow-hidden rounded-[1.5rem] bg-slate-950">
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-white/60">
            <div>
              <p className="text-2xl">📹</p>
              <p className="mt-2 text-sm">Camera inactive - click below to start</p>
            </div>
          </div>
        )}
      </div>

      {confidence > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Confidence</span>
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-amber-400" style={{ width: `${confidence * 100}%` }} />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Latest predictions</p>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {results.map((result, index) => (
              <div key={`${result.text}-${result.timestamp}-${index}`} className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/40 dark:bg-slate-950/60">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{result.text}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{result.provider}</p>
                </div>
                <span className="text-sm font-black text-teal-700 dark:text-teal-300">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <p className="font-black">Recognition error</p>
          <p className="mt-1">{error.message}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRecognitionToggle}
          disabled={!isInitialized && cameraActive}
          className="rounded-full bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          {!cameraActive ? "Start Camera" : isRecognizing ? "Stop Recognition" : "Start Recognition"}
        </button>
        <button
          onClick={stopCamera}
          disabled={!cameraActive}
          className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Stop Camera
        </button>
        <button
          onClick={clearResults}
          disabled={results.length === 0}
          className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Clear History
        </button>
      </div>

      <div className={`rounded-3xl border p-4 text-xs leading-6 ${
        runtime.provider === "demo" 
          ? "border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10"
          : "border-green-200 bg-green-50/70 dark:border-green-500/30 dark:bg-green-500/10"
      }`}>
        {runtime.provider === "demo" ? (
          <>
            <p className="font-bold text-amber-900 dark:text-amber-200">⚠️ Demo Fallback Active</p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              {runtime.fallbackReason || "Backend unavailable. Using demo predictions. Connect a backend to enable real camera recognition."}
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-green-900 dark:text-green-200">✓ Backend Connected</p>
            <p className="mt-1 text-green-800 dark:text-green-300">Real-time camera recognition is active.</p>
          </>
        )}
      </div>

      {/* Debug Diagnostics Panel */}
      {debug && metricsCollector && (
        <RecognitionDiagnostics
          collector={metricsCollector}
          prediction={results.length > 0 ? results[0]?.text : null}
          confidence={confidence}
          latencyMs={latencyMs}
          modelName={modelName}
          apiVersion={apiVersion}
          fps={fps}
          requestInFlight={requestInFlight}
          droppedFrames={droppedFrames}
          sequenceLength={sequenceLength}
        />
      )}
    </div>
  );
}
