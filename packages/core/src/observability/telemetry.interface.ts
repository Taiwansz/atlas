import { Span, SpanOptions } from '@opentelemetry/api';

export interface ITelemetry {
  startSpan(name: string, options?: SpanOptions): Span;
  recordException(span: Span, error: Error): void;
  endSpan(span: Span): void;
  incrementCounter(name: string, value?: number, attributes?: Record<string, any>): void;
  recordGauge(name: string, value: number, attributes?: Record<string, any>): void;
}
