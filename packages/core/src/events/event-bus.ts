import { EventEmitter } from 'events';
import type { IEventBus, IEventEnvelope } from './event.interface';
import type { ILogger } from '../logging/logger.interface';
import { EventBusException } from '../errors/errors';

export class InMemoryEventBus implements IEventBus {
  private readonly emitter: EventEmitter;
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Allow scaling without event warnings
    this.logger = logger;
  }

  public publish(topic: string, event: IEventEnvelope): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventType} [ID: ${event.eventId}] to topic ${topic}`, {
      topic,
      eventId: event.eventId,
      eventType: event.eventType,
    });

    try {
      // Defer execution using setImmediate to maintain asynchronous behavior
      setImmediate(() => {
        this.emitter.emit(topic, event);
      });
    } catch (error: unknown) {
      const cause = this.toError(error);
      this.logger.error(`Failed to publish event to topic ${topic}`, cause);
      throw new EventBusException(`Failed to publish event: ${cause.message}`);
    }

    return Promise.resolve();
  }

  public subscribe(
    topic: string,
    handler: (event: IEventEnvelope) => Promise<void>
  ): Promise<void> {
    this.logger.info(`Subscribing to topic ${topic}`);
    this.emitter.on(topic, (event: IEventEnvelope) => {
      void this.handleEvent(topic, event, handler);
    });

    return Promise.resolve();
  }

  private async handleEvent(
    topic: string,
    event: IEventEnvelope,
    handler: (event: IEventEnvelope) => Promise<void>
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error: unknown) {
      this.logger.error(
        `Error processing event ${event.eventType} on topic ${topic}`,
        this.toError(error),
        {
          topic,
          eventId: event.eventId,
        }
      );
      // Here we could publish to a Dead Letter Queue (DLQ) topic
    }
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
