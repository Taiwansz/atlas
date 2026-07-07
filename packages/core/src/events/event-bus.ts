import { EventEmitter } from 'events';
import { IEventBus, IEventEnvelope } from './event.interface';
import { ILogger } from '../logging/logger.interface';
import { EventBusException } from '../errors/errors';

export class InMemoryEventBus implements IEventBus {
  private readonly emitter: EventEmitter;
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Allow scaling without event warnings
    this.logger = logger;
  }

  public async publish(topic: string, event: IEventEnvelope): Promise<void> {
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
    } catch (err: any) {
      this.logger.error(`Failed to publish event to topic ${topic}`, err);
      throw new EventBusException(`Failed to publish event: ${err.message}`);
    }
  }

  public async subscribe(
    topic: string,
    handler: (event: IEventEnvelope) => Promise<void>
  ): Promise<void> {
    this.logger.info(`Subscribing to topic ${topic}`);
    
    this.emitter.on(topic, async (event: IEventEnvelope) => {
      try {
        await handler(event);
      } catch (err: any) {
        this.logger.error(`Error processing event ${event.eventType} on topic ${topic}`, err, {
          topic,
          eventId: event.eventId,
        });
        // Here we could publish to a Dead Letter Queue (DLQ) topic
      }
    });
  }
}
