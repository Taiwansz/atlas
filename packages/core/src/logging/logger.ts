import * as winston from 'winston';
import { ILogger } from './logger.interface';
import { trace, context } from '@opentelemetry/api';

export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private readonly serviceName: string;

  constructor(serviceName: string, level: string = 'info') {
    this.serviceName = serviceName;
    this.logger = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: this.serviceName },
      transports: [
        new winston.transports.Console({
          stderrLevels: ['error', 'critical'],
        }),
      ],
    });
  }

  private getTraceContext(): Record<string, string> {
    const activeSpan = trace.getSpan(context.active());
    if (!activeSpan) {
      return {};
    }
    const spanContext = activeSpan.spanContext();
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    };
  }

  public debug(message: string, ctx?: Record<string, any>): void {
    this.logger.debug(message, { ...this.getTraceContext(), context: ctx });
  }

  public info(message: string, ctx?: Record<string, any>): void {
    this.logger.info(message, { ...this.getTraceContext(), context: ctx });
  }

  public warn(message: string, ctx?: Record<string, any>): void {
    this.logger.warn(message, { ...this.getTraceContext(), context: ctx });
  }

  public error(message: string, error?: Error, ctx?: Record<string, any>): void {
    this.logger.error(message, {
      ...this.getTraceContext(),
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      context: ctx,
    });
  }
}
