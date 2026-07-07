import { ConfigManager } from './config/config';
import { Container } from './di/container';
import { WinstonLogger } from './logging/logger';
import { InMemoryEventBus } from './events/event-bus';
import { IEventEnvelope } from './events/event.interface';
import { ConfigurationException, ConstitutionViolationException } from './errors/errors';

describe('Atlas Core Module', () => {
  beforeEach(() => {
    ConfigManager.clear();
    Container.clear();
  });

  describe('ConfigManager', () => {
    it('should load default configuration settings successfully', () => {
      const config = ConfigManager.load();
      expect(config.env).toBe('test');
      expect(config.port).toBe(8080);
      expect(config.database.maxConnections).toBe(20);
      expect(config.ai.primaryProvider).toBe('anthropic');
    });

    it('should throw ConfigurationException when validation fails', () => {
      process.env.PORT = 'invalid-port-number';
      expect(() => ConfigManager.load()).toThrow(ConfigurationException);
      delete process.env.PORT;
    });
  });

  describe('Dependency Injection Container', () => {
    interface IMockService {
      getValue(): string;
    }

    class MockService implements IMockService {
      public getValue() {
        return 'atlas-v2';
      }
    }

    it('should register and resolve singletons correctly', () => {
      const service = new MockService();
      Container.register<IMockService>('MockToken', service);

      const resolved = Container.resolve<IMockService>('MockToken');
      expect(resolved).toBe(service);
      expect(resolved.getValue()).toBe('atlas-v2');
    });

    it('should resolve factories and cache instances', () => {
      let factoryCalls = 0;
      Container.registerFactory<IMockService>('FactoryToken', () => {
        factoryCalls++;
        return new MockService();
      });

      const firstResolve = Container.resolve<IMockService>('FactoryToken');
      const secondResolve = Container.resolve<IMockService>('FactoryToken');

      expect(firstResolve).toBe(secondResolve);
      expect(factoryCalls).toBe(1);
    });

    it('should throw error when resolving unregistered token', () => {
      expect(() => Container.resolve('NonExistentToken')).toThrow();
    });
  });

  describe('InMemoryEventBus', () => {
    it('should publish events to subscribers asynchronously', (done) => {
      const logger = new WinstonLogger('test-service', 'error');
      const eventBus = new InMemoryEventBus(logger);

      const testEnvelope: IEventEnvelope = {
        eventId: 'evt_001',
        eventType: 'test.event',
        projectId: 'proj_test',
        actorId: 'usr_dev',
        timestamp: Date.now(),
        schemaVersion: 1,
        payload: { success: true },
      };

      eventBus.subscribe('test.event', async (event) => {
        try {
          expect(event.eventId).toBe('evt_001');
          expect(event.payload.success).toBe(true);
          done();
        } catch (error) {
          done(error);
        }
      });

      eventBus.publish('test.event', testEnvelope);
    });
  });

  describe('Custom Exceptions', () => {
    it('should carry custom code and context attributes', () => {
      const error = new ConstitutionViolationException('Invalid egress route', 'II.3');
      expect(error.code).toBe('ATLAS_CONSTITUTION_VIOLATION');
      expect(error.invariantId).toBe('II.3');
      expect(error.message).toContain('II.3');
    });
  });
});
