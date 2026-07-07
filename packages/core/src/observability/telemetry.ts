import { trace, metrics, Span, SpanOptions, Tracer, Meter } from '@opentelemetry/api';
import { ITelemetry } from './telemetry.interface';

export class OpenTelemetryService implements ITelemetry {
  private readonly tracer: Tracer;
  private readonly meter: Meter;

  constructor(serviceName: string) {
    this.tracer = trace.getTracer(serviceName);
    this.meter = metrics.getMeter(serviceName);
  }

  public startSpan(name: string, options?: SpanOptions): Span {
    return this.tracer.startSpan(name, options);
  }

  public recordException(span: Span, error: Error): void {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message }); // 2 = ERROR status in OTel
  }

  public endSpan(span: Span): void {
    span.end();
  }

  public incrementCounter(name: string, value: number = 1, attributes?: Record<string, any>): void {
    const counter = this.meter.createCounter(name);
    counter.add(value, attributes);
  }

  public recordGauge(name: string, value: number, attributes?: Record<string, any>): void {
    const gauge = this.meter.createUpDownCounter(name); // standard OTel approximation for updown meters
    gauge.add(value, attributes);
  }
}
