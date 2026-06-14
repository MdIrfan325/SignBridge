"use client";

import { useState } from "react";
import type { RecognitionMetricsCollector } from "@/lib/recognition-metrics";

interface RecognitionDiagnosticsProps {
  collector: RecognitionMetricsCollector;
  prediction: string | null;
  confidence: number;
  latencyMs: number | null;
  modelName: string | null;
  apiVersion: string | null;
  fps: number;
  requestInFlight: boolean;
  droppedFrames: number;
  sequenceLength: number | null;
}

export function RecognitionDiagnostics({
  collector,
  prediction,
  confidence,
  latencyMs,
  modelName,
  apiVersion,
  fps,
  requestInFlight,
  droppedFrames,
  sequenceLength,
}: RecognitionDiagnosticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = collector.getStats();

  const handleExportCSV = () => {
    const csv = collector.exportCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `recognition-metrics-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    collector.clear();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-lg border border-slate-300 bg-slate-950 text-white shadow-2xl">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-slate-900 px-4 py-3 text-sm font-bold hover:bg-slate-800"
      >
        <span>🔧 Recognition Diagnostics</span>
        <span>{isExpanded ? "▼" : "▶"}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto bg-slate-950 p-4 text-xs space-y-3">
          {/* Current Prediction */}
          <div className="border-l-2 border-teal-500 pl-3">
            <p className="font-bold text-teal-400">Current Prediction</p>
            <p className="mt-1 text-base font-black text-white">{prediction || "—"}</p>
            <p className="text-slate-400">Confidence: {(confidence * 100).toFixed(1)}%</p>
          </div>

          {/* Backend Metadata */}
          <div className="border-l-2 border-amber-500 pl-3">
            <p className="font-bold text-amber-400">Backend</p>
            <p className="mt-1 text-slate-300">Model: {modelName || "—"}</p>
            <p className="text-slate-300">API: {apiVersion || "—"}</p>
            <p className="text-slate-300">Sequence length: {sequenceLength || "—"}</p>
          </div>

          {/* Latency Metrics */}
          <div className="border-l-2 border-green-500 pl-3">
            <p className="font-bold text-green-400">Latency</p>
            <p className="mt-1 text-slate-300">Backend latency: {latencyMs ? `${latencyMs.toFixed(1)}ms` : "—"}</p>
            <p className="text-slate-300">Avg latency: {stats.avg_latency_ms}ms (min: {stats.min_latency_ms}ms, max: {stats.max_latency_ms}ms)</p>
          </div>

          {/* Throughput */}
          <div className="border-l-2 border-blue-500 pl-3">
            <p className="font-bold text-blue-400">Throughput</p>
            <p className="mt-1 text-slate-300">Current FPS: {fps.toFixed(1)}</p>
            <p className="text-slate-300">Requests in flight: {requestInFlight ? "1" : "0"}</p>
            <p className="text-slate-300">Dropped frames: {droppedFrames}</p>
          </div>

          {/* Statistics */}
          <div className="border-l-2 border-purple-500 pl-3">
            <p className="font-bold text-purple-400">Statistics</p>
            <p className="mt-1 text-slate-300">Total requests: {stats.count}</p>
            <p className="text-slate-300">Avg confidence: {(stats.avg_confidence * 100).toFixed(1)}%</p>
            <p className="text-slate-300">Errors: {stats.error_count}</p>
            <p className="text-slate-300">Dropped: {stats.dropped_count}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-slate-700 pt-3">
            <button
              onClick={handleExportCSV}
              className="flex-1 rounded bg-blue-600 px-2 py-1 hover:bg-blue-500"
            >
              Export CSV
            </button>
            <button onClick={handleClear} className="flex-1 rounded bg-red-600 px-2 py-1 hover:bg-red-500">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
