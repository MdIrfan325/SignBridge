"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultConfig,
  initializeModel,
  recognizeStream,
  type RecognitionConfig,
  type RecognitionResult,
} from "@/lib/recognition-service";
import { RecognitionMetricsCollector, type RequestMetric } from "@/lib/recognition-metrics";
import type { SignLanguageKey } from "@/lib/sign-data";

interface UseSignRecognitionDebugOptions {
  language?: SignLanguageKey;
  onResult?: (result: RecognitionResult & { metrics?: Partial<RequestMetric> }) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
  metricsCollector?: RecognitionMetricsCollector;
}

interface UseSignRecognitionDebugState {
  isInitialized: boolean;
  isRecognizing: boolean;
  results: (RecognitionResult & { metrics?: Partial<RequestMetric> })[];
  confidence: number;
  error: Error | null;
  fps: number;
  requestInFlight: boolean;
  droppedFrames: number;
}

export function useSignRecognitionDebug(options: UseSignRecognitionDebugOptions = {}) {
  const { language = "isl", onResult, onError, debug = false, metricsCollector } = options;

  const [state, setState] = useState<UseSignRecognitionDebugState>({
    isInitialized: false,
    isRecognizing: false,
    results: [],
    confidence: 0,
    error: null,
    fps: 0,
    requestInFlight: false,
    droppedFrames: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const configRef = useRef<RecognitionConfig>(getDefaultConfig(language));
  const metricsRef = useRef(metricsCollector || new RecognitionMetricsCollector());
  const lastInferenceTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);
  const droppedFramesRef = useRef<number>(0);

  // Throttle inference to 100-150ms between requests
  const INFERENCE_THROTTLE_MS = 120;

const onErrorRef = useRef(onError);

useEffect(() => {
  onErrorRef.current = onError;
}, [onError]);

useEffect(() => {
  configRef.current = getDefaultConfig(language);
  abortControllerRef.current?.abort();

  let mounted = true;

  (async () => {
    try {
      if (mounted) {
        setState((prev) => ({
          ...prev,
          isInitialized: false,
          isRecognizing: false,
          error: null,
          results: [],
          confidence: 0,
        }));
      }

      await initializeModel(language);

      if (mounted) {
        setState((prev) => ({
          ...prev,
          isInitialized: true,
          error: null,
        }));
      }
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error(String(error));

      if (mounted) {
        setState((prev) => ({
          ...prev,
          error: err,
          isInitialized: false,
        }));
      }

      onErrorRef.current?.(err);
    }
  })();

  return () => {
    mounted = false;
    abortControllerRef.current?.abort();
  };
}, [language]);

  const canInferNow = useCallback(() => {
    const now = Date.now();
    return now - lastInferenceTimeRef.current >= INFERENCE_THROTTLE_MS;
  }, []);

  const startRecognition = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!state.isInitialized) {
        const error = new Error("Recognition service is not initialized yet.");
        setState((prev) => ({ ...prev, error }));
        onError?.(error);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, isRecognizing: true, error: null }));
      fpsCounterRef.current = [];
      droppedFramesRef.current = 0;

      try {
        for await (const result of recognizeStream(videoElement, configRef.current, controller.signal)) {
          if (controller.signal.aborted) {
            break;
          }

          const now = Date.now();
          const canInfer = canInferNow();

          if (!canInfer) {
            droppedFramesRef.current += 1;

            if (debug && metricsRef.current) {
              metricsRef.current.record({
                timestamp: now,
                capture_ms: 0,
                http_ms: 0,
                backend_latency_ms: null,
                total_latency_ms: 0,
                prediction: result.text,
                confidence: result.confidence,
                request_bytes: 0,
                response_bytes: 0,
                request_in_flight: false,
                dropped: true,
                error: "throttled",
              });
            }
            continue;
          }

          lastInferenceTimeRef.current = now;
          fpsCounterRef.current.push(now);

          // Remove FPS samples older than 1 second
          fpsCounterRef.current = fpsCounterRef.current.filter((t) => now - t < 1000);

          const resultWithMetrics = {
            ...result,
            metrics: debug
              ? {
                  timestamp: now,
                  backend_latency_ms: result.latencyMs,
                  total_latency_ms: result.latencyMs || 0,
                }
              : undefined,
          };

          if (debug && metricsRef.current) {
            metricsRef.current.record({
              timestamp: now,
              capture_ms: result.captureMs || 0,
              http_ms: result.httpMs || 0,
              backend_latency_ms: result.latencyMs || null,
              total_latency_ms: (result.captureMs || 0) + (result.httpMs || 0),
              prediction: result.text,
              confidence: result.confidence,
              request_bytes: 0,
              response_bytes: 0,
              request_in_flight: false,
              dropped: false,
              error: null,
            });
          }

          setState((prev) => ({
            ...prev,
            results: [resultWithMetrics, ...prev.results].slice(0, 10),
            confidence: result.confidence,
            fps: fpsCounterRef.current.length,
            droppedFrames: droppedFramesRef.current,
          }));
          onResult?.(resultWithMetrics);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, error: err }));
        onError?.(err);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        setState((prev) => ({ ...prev, isRecognizing: false }));
      }
    },
    [state.isInitialized, onResult, onError, debug, canInferNow],
  );

  const stopRecognition = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState((prev) => ({ ...prev, isRecognizing: false }));
  }, []);

  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, results: [], confidence: 0, droppedFrames: 0 }));
    droppedFramesRef.current = 0;
    if (debug && metricsRef.current) {
      metricsRef.current.clear();
    }
  }, [debug]);

  return useMemo(
    () => ({
      ...state,
      startRecognition,
      stopRecognition,
      clearResults,
      metricsCollector: metricsRef.current,
    }),
    [state, startRecognition, stopRecognition, clearResults],
  );
}
