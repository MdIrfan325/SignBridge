"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultConfig,
  initializeModel,
  recognizeStream,
  type RecognitionConfig,
  type RecognitionResult,
} from "@/lib/recognition-service";
import type { SignLanguageKey } from "@/lib/sign-data";

interface UseSignRecognitionOptions {
  language?: SignLanguageKey;
  onResult?: (result: RecognitionResult) => void;
  onError?: (error: Error) => void;
}

interface UseSignRecognitionState {
  isInitialized: boolean;
  isRecognizing: boolean;
  results: RecognitionResult[];
  confidence: number;
  error: Error | null;
}

export function useSignRecognition(options: UseSignRecognitionOptions = {}) {
  const { language = "isl", onResult, onError } = options;

  const [state, setState] = useState<UseSignRecognitionState>({
    isInitialized: false,
    isRecognizing: false,
    results: [],
    confidence: 0,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const configRef = useRef<RecognitionConfig>(getDefaultConfig(language));

  useEffect(() => {
    configRef.current = getDefaultConfig(language);
    abortControllerRef.current?.abort();

    let mounted = true;

    (async () => {
      setState((prev) => ({
        ...prev,
        isInitialized: false,
        isRecognizing: false,
        error: null,
        results: [],
        confidence: 0,
      }));

      try {
        await initializeModel(language);

        if (mounted) {
          setState((prev) => ({ ...prev, isInitialized: true, error: null }));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (mounted) {
          setState((prev) => ({ ...prev, error: err, isInitialized: false }));
        }
        onError?.(err);
      }
    })();

    return () => {
      mounted = false;
      abortControllerRef.current?.abort();
    };
  }, [language, onError]);

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

      try {
        for await (const result of recognizeStream(videoElement, configRef.current, controller.signal)) {
          if (controller.signal.aborted) {
            break;
          }

          setState((prev) => ({
            ...prev,
            results: [result, ...prev.results].slice(0, 10),
            confidence: result.confidence,
          }));
          onResult?.(result);
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
    [state.isInitialized, onResult, onError],
  );

  const stopRecognition = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState((prev) => ({ ...prev, isRecognizing: false }));
  }, []);

  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, results: [], confidence: 0 }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      startRecognition,
      stopRecognition,
      clearResults,
    }),
    [state, startRecognition, stopRecognition, clearResults],
  );
}
