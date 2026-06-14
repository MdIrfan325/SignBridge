/**
 * Recognition pipeline metrics collection
 * Tracks end-to-end latency, throughput, and errors
 */

export interface RequestMetric {
  timestamp: number;
  capture_ms: number;
  http_ms: number;
  backend_latency_ms: number | null;
  total_latency_ms: number;
  prediction: string;
  confidence: number;
  request_bytes: number;
  response_bytes: number;
  request_in_flight: boolean;
  dropped: boolean;
  error: string | null;
}

export class RecognitionMetricsCollector {
  private metrics: RequestMetric[] = [];
  private maxHistorySize = 500;

  record(metric: RequestMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }
  }

  getMetrics(): RequestMetric[] {
    return [...this.metrics];
  }

  getLastN(n: number): RequestMetric[] {
    return this.metrics.slice(-n);
  }

  getStats() {
    if (this.metrics.length === 0) {
      return {
        count: 0,
        avg_latency_ms: 0,
        min_latency_ms: 0,
        max_latency_ms: 0,
        avg_confidence: 0,
        dropped_count: 0,
        error_count: 0,
        current_fps: 0,
      };
    }

    const latencies = this.metrics.map((m) => m.total_latency_ms);
    const confidences = this.metrics.map((m) => m.confidence);
    const droppedCount = this.metrics.filter((m) => m.dropped).length;
    const errorCount = this.metrics.filter((m) => m.error !== null).length;

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);

    // FPS: requests in last second
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentCount = this.metrics.filter((m) => m.timestamp >= oneSecondAgo).length;

    return {
      count: this.metrics.length,
      avg_latency_ms: Math.round(avgLatency),
      min_latency_ms: Math.round(minLatency),
      max_latency_ms: Math.round(maxLatency),
      avg_confidence: Math.round(avgConfidence * 100) / 100,
      dropped_count: droppedCount,
      error_count: errorCount,
      current_fps: recentCount,
    };
  }

  exportCSV(): string {
    const headers = [
      "timestamp",
      "capture_ms",
      "http_ms",
      "backend_latency_ms",
      "total_latency_ms",
      "prediction",
      "confidence",
      "request_bytes",
      "response_bytes",
      "dropped",
      "error",
    ];

    const rows = this.metrics.map((m) => [
      new Date(m.timestamp).toISOString(),
      m.capture_ms.toFixed(2),
      m.http_ms.toFixed(2),
      m.backend_latency_ms?.toFixed(2) ?? "",
      m.total_latency_ms.toFixed(2),
      m.prediction,
      m.confidence.toFixed(4),
      m.request_bytes,
      m.response_bytes,
      m.dropped ? "yes" : "no",
      m.error ?? "",
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  }

  clear(): void {
    this.metrics = [];
  }
}
