"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LANGUAGES, languageMap, type SignLanguageKey, type SignMode } from "@/lib/sign-data";

type OutputPrediction = {
  label: string;
  type: SignMode;
  confidence: number;
  note: string;
};

type HistoryItem = OutputPrediction & {
  time: string;
};

const languageOptions = LANGUAGES.map((language) => language.key);

export default function TranslatorClient() {
  const searchParams = useSearchParams();
  const initialLanguage = (searchParams.get("language") as SignLanguageKey | null) || "asl";
  const language = languageMap[initialLanguage] || languageMap.asl;
  const [selectedLanguage, setSelectedLanguage] = useState<SignLanguageKey>(language.key);
  const [mode, setMode] = useState<SignMode>("word");
  const [running, setRunning] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [prediction, setPrediction] = useState<OutputPrediction | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const predictionIndexRef = useRef(0);

  const currentLanguage = languageMap[selectedLanguage];
  const pool = mode === "alphabet" ? currentLanguage.alphabet.map((entry) => entry.label) : currentLanguage.words.map((sign) => sign.label);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const predictNext = () => {
    const label = pool[predictionIndexRef.current % pool.length];
    predictionIndexRef.current += 1;
    const confidence = Math.floor(76 + Math.random() * 20);

    const nextPrediction: OutputPrediction = {
      label,
      type: mode,
      confidence,
      note: mode === "alphabet" ? "Alphabet prototype prediction" : "Word prototype prediction",
    };

    const nextHistory: HistoryItem[] = [
      {
        ...nextPrediction,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...history,
    ].slice(0, 10);

    setPrediction(nextPrediction);
    setHistory(nextHistory);
  };

  const startCamera = async () => {
    setPermissionError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("Camera access is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setRunning(true);
      predictNext();
      timerRef.current = setInterval(predictNext, 2200);
    } catch {
      setPermissionError("Camera permission was blocked. Allow camera access or use demo detection.");
    }
  };

  const stopCamera = () => {
    stopTimer();
    stopStream();
    setRunning(false);
  };

  const copyOutput = async () => {
    if (!prediction) return;
    await navigator.clipboard.writeText(prediction.label);
  };

  const speakOutput = () => {
    if (!prediction) return;
    const utterance = new SpeechSynthesisUtterance(prediction.label);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
    };
  }, []);

  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-600 dark:text-cyan-300">
            Live translator
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Camera translation workspace
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Choose a sign language, start the camera, and test the interface. The prototype uses starter labels until a trained ASL, WSL, or ISL model is connected.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="aspect-video overflow-hidden rounded-[1.5rem] bg-slate-950">
              <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
              {!running && (
                <div className="grid h-full place-items-center p-6 text-center">
                  <div>
                    <p className="text-2xl font-black text-white">Camera is idle</p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
                      Start the camera to run the prototype detection loop or connect a trained model to replace it.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button onClick={running ? stopCamera : startCamera} className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700">
                {running ? "Stop camera" : "Start camera"}
              </button>
              <button onClick={predictNext} disabled={!running} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
                Run demo detection
              </button>
            </div>

            {permissionError && (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {permissionError}
              </p>
            )}

            <div className="mt-5 rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Prototype status
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                This interface is built for real model integration. The current demo cycles through the selected language starter set so the UI can be tested without external services.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">Language</span>
                <select
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value as SignLanguageKey)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {languageOptions.map((key) => (
                    <option key={key} value={key}>
                      {languageMap[key].shortName} — {languageMap[key].name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">Mode</span>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as SignMode)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="word">Words and phrases</option>
                  <option value="alphabet">Alphabet</option>
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-300">
                Current prediction
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black tracking-tight text-slate-950 dark:text-white">
                    {prediction ? prediction.label : "—"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {prediction ? prediction.note : "Waiting for input"}
                  </p>
                </div>
                {prediction && (
                  <div className="text-right">
                    <p className="text-3xl font-black text-indigo-600 dark:text-cyan-300">{prediction.confidence}%</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">confidence</p>
                  </div>
                )}
              </div>

              {prediction && (
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900">
                  <div className={`h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500`} style={{ width: `${prediction.confidence}%` }} />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={copyOutput} disabled={!prediction} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950">
                  Copy text
                </button>
                <button onClick={speakOutput} disabled={!prediction} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
                  Speak
                </button>
                <button onClick={() => setHistory([])} disabled={history.length === 0} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
                  Clear history
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Recent history</h2>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{history.length} items</span>
              </div>
              <div className="mt-4 grid gap-3">
                {history.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    No predictions yet.
                  </p>
                ) : (
                  history.map((item, index) => (
                    <div key={`${item.label}-${item.time}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950 dark:text-white">{item.label}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {item.type} · {item.note}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-indigo-600 dark:text-cyan-300">{item.confidence}%</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
