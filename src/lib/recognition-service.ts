import { languageMap, type SignLanguageKey } from "@/lib/sign-data";

export type RecognitionProviderName = "demo" | "openhands" | "custom" | "future-cloud";

export interface RecognitionResult {
  text: string;
  confidence: number;
  timestamp: number;
  language: SignLanguageKey;
  provider: RecognitionProviderName;
  sessionId: string;
  sequenceLength: number;
  latencyMs?: number;
  model?: string;
}

export interface RecognitionConfig {
  latency_ms?: number | null;
  model?: string;
  minConfidence: number;
  maxFrameRate: number;
  language: SignLanguageKey;
  preprocessingLevel: "minimal" | "standard" | "enhanced";
  sequenceLength: number;
  backendUrl: string;
  sessionId: string;
}

interface CapturedFrame {
  image: string;
  width: number;
  height: number;
  mimeType: "image/jpeg";
}

interface RecognitionProvider {
  name: RecognitionProviderName;
  initialize(language: SignLanguageKey): Promise<boolean>;
  recognizeFrame(
    frame: CapturedFrame,
    config: RecognitionConfig,
    signal?: AbortSignal,
  ): Promise<RecognitionResult | null>;
}

interface RecognitionRuntime {
  provider: RecognitionProviderName;
  backendAvailable: boolean;
  backendUrl: string;
  fallbackReason?: string;
}

interface RecognitionApiResponse {
  api_version?: string;
  session_id: string;
  status: "buffering" | "predicted" | "degraded" | "error";
  message: string;
  sequence_length: number;
  frames_collected: number;
  prediction: {
    label: string;
    confidence: number;
    label_id?: string | null;
    source?: string | null;
  } | null;
  model_loaded: boolean;
  backend: string;
  labels: string[];
}

const defaultBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8000";
const providerPreference = process.env.NEXT_PUBLIC_RECOGNITION_PROVIDER?.trim().toLowerCase() || "auto";

let activeProvider: RecognitionProvider;
let runtimeState: RecognitionRuntime = {
  provider: "demo",
  backendAvailable: false,
  backendUrl: defaultBackendUrl,
  fallbackReason: "Demo fallback is active until the backend is reachable and warmed up.",
};

const languagePools: Record<SignLanguageKey, { words: string[]; alphabet: string[] }> = {
  asl: {
    words: ["hello", "thank you", "please", "sorry", "help", "today", "home", "school"],
    alphabet: languageMap.asl.alphabet.map((entry) => entry.label),
  },
  wsl: {
    words: ["hello", "mother", "father", "friend", "water", "food", "good", "yes"],
    alphabet: languageMap.wsl.alphabet.map((entry) => entry.label),
  },
  isl: {
    words: ["hello", "thank you", "please", "sorry", "help", "today", "home", "school"],
    alphabet: languageMap.isl.alphabet.map((entry) => entry.label),
  },
};

function createSessionId(): string {
  return globalThis.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function updateRuntime(nextState: Partial<RecognitionRuntime>): void {
  runtimeState = {
    ...runtimeState,
    ...nextState,
  };
}

function isVideoReady(videoElement: HTMLVideoElement): boolean {
  return videoElement.readyState >= 2 && !videoElement.paused && !videoElement.ended;
}

function pickLabel(language: SignLanguageKey, sequenceLength: number, frameIndex: number): string {
  const pool = sequenceLength % 2 === 0 ? languagePools[language].words : languagePools[language].alphabet;
  return pool[frameIndex % pool.length] || "hello";
}

function createDemoProvider(): RecognitionProvider {
  let frameIndex = 0;

  return {
    name: "demo",
    async initialize(language) {
      updateRuntime({
        provider: "demo",
        backendAvailable: false,
        fallbackReason: `Demo provider selected for ${language.toUpperCase()} until the backend is ready.`,
      });
      return true;
    },
    async recognizeFrame(_frame, config) {
      const label = pickLabel(config.language, config.sequenceLength, frameIndex);
      frameIndex += 1;

      return {
        text: label,
        confidence: Math.max(config.minConfidence, 0.78 + (frameIndex % 3) * 0.04),
        timestamp: Date.now(),
        language: config.language,
        provider: "demo",
        sessionId: config.sessionId,
        sequenceLength: config.sequenceLength,
        latencyMs: 0,
        model: "demo",
      };
    },
  };
}

function createOpenHandsProvider(): RecognitionProvider {
  return {
    name: "openhands",
    async initialize(language) {
      try {
        const response = await fetch(`${defaultBackendUrl}/health`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          updateRuntime({
            provider: "demo",
            backendAvailable: false,
            fallbackReason: `Backend health check failed for ${language.toUpperCase()}; using Demo fallback.`,
          });
          return false;
        }

        const payload = (await response.json()) as { model_loaded?: boolean; backend?: string; message?: string };

        if (!payload.model_loaded) {
          updateRuntime({
            provider: "demo",
            backendAvailable: true,
            fallbackReason: payload.message || "Backend is reachable but no checkpoint is configured yet.",
          });
          return false;
        }

        updateRuntime({
          provider: "openhands",
          backendAvailable: true,
          fallbackReason: undefined,
        });
        return true;
      } catch (error) {
        updateRuntime({
          provider: "demo",
          backendAvailable: false,
          fallbackReason: error instanceof Error ? error.message : "Backend unreachable; using Demo fallback.",
        });
        return false;
      }
    },
    async recognizeFrame(frame, config, signal) {
      try {
        const response = await fetch(`${config.backendUrl}/api/v1/recognize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            session_id: config.sessionId,
            language: config.language,
            image: frame.image,
            frame_index: 0,
            timestamp: Date.now(),
            sequence_length: config.sequenceLength,
            preprocessing_level: config.preprocessingLevel,
            width: frame.width,
            height: frame.height,
          }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Recognition request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as RecognitionApiResponse;
        if (!payload.prediction || payload.status !== "predicted") {
          return null;
        }

        return {
          text: payload.prediction.label,
          confidence: payload.prediction.confidence,
          timestamp: Date.now(),
          language: config.language,
          provider: "openhands",
          sessionId: payload.session_id,
          sequenceLength: payload.sequence_length,
          latencyMs: payload.latency_ms ?? undefined,
          model: payload.model ?? "openhands-lstm",
        };
      } catch (error) {
        updateRuntime({
          provider: "demo",
          backendAvailable: false,
          fallbackReason: error instanceof Error ? error.message : "Recognition backend failed; using Demo fallback.",
        });
        activeProvider = demoProvider;
        return demoProvider.recognizeFrame(frame, config, signal);
      }
    },
  };
}

const demoProvider = createDemoProvider();
const openHandsProvider = createOpenHandsProvider();

activeProvider = demoProvider;

/**
 * Initialize the active recognition provider.
 * Falls back to the demo provider when the backend is unavailable.
 */
export async function initializeModel(language: SignLanguageKey = "isl"): Promise<boolean> {
  if (providerPreference === "demo") {
    activeProvider = demoProvider;
    await activeProvider.initialize(language);
    return true;
  }

  const backendReady = await openHandsProvider.initialize(language);
  activeProvider = backendReady ? openHandsProvider : demoProvider;

  if (!backendReady) {
    await demoProvider.initialize(language);
  }

  return true;
}

/**
 * Minimal browser preprocessing.
 * Captures a compact JPEG frame that the backend can buffer into a temporal sequence.
 */
export function preprocessFrame(
  videoElement: HTMLVideoElement,
  level: "minimal" | "standard" | "enhanced" = "minimal",
): CapturedFrame {
  const width = level === "enhanced" ? 960 : level === "standard" ? 768 : 640;
  const height = level === "enhanced" ? 720 : level === "standard" ? 576 : 480;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context not available");
  }

  context.drawImage(videoElement, 0, 0, width, height);

  return {
    image: canvas.toDataURL("image/jpeg", 0.82),
    width,
    height,
    mimeType: "image/jpeg",
  };
}

/**
 * Run a single recognition request using the currently selected provider.
 */
export async function recognizeFrame(
  frame: CapturedFrame,
  config: RecognitionConfig,
  signal?: AbortSignal,
): Promise<RecognitionResult | null> {
  return activeProvider.recognizeFrame(frame, config, signal);
}

/**
 * Continuous recognition from a camera stream.
 */
export async function* recognizeStream(
  videoElement: HTMLVideoElement,
  config: RecognitionConfig,
  signal?: AbortSignal,
): AsyncGenerator<RecognitionResult> {
  const frameDuration = Math.max(1000 / config.maxFrameRate, 80);
  let lastFrameTime = 0;

  while (!signal?.aborted && isVideoReady(videoElement)) {
    const now = Date.now();

    if (now - lastFrameTime >= frameDuration) {
      const frame = preprocessFrame(videoElement, config.preprocessingLevel);
      const result = await recognizeFrame(frame, config, signal);

      if (result && result.confidence >= config.minConfidence) {
        yield result;
      }

      lastFrameTime = now;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 32));
  }
}

export function getRecognitionRuntime(): RecognitionRuntime {
  return runtimeState;
}

/**
 * Get the default client configuration.
 */
export function getDefaultConfig(language: SignLanguageKey = "isl"): RecognitionConfig {
  return {
    minConfidence: 0.6,
    maxFrameRate: 12,
    language,
    preprocessingLevel: "minimal",
    sequenceLength: 32,
    backendUrl: defaultBackendUrl,
    sessionId: createSessionId(),
  };
}
