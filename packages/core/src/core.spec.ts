import { ConfigManager } from './config/config';
import { Container } from './di/container';
import { WinstonLogger } from './logging/logger';
import { InMemoryEventBus } from './events/event-bus';
import type { IEventEnvelope } from './events/event.interface';
import { ConfigurationException, ConstitutionViolationException } from './errors/errors';
import { LocalFeatureFlagService } from './feature-flags/feature-flags';


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
    it('should publish events to subscribers asynchronously', async () => {
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

      const received = new Promise<void>((resolve, reject) => {
        const rejectWithError = (error: unknown): void => {
          reject(error instanceof Error ? error : new Error(String(error)));
        };

        void eventBus
          .subscribe('test.event', (event) => {
            try {
              expect(event.eventId).toBe('evt_001');
              expect(event.payload.success).toBe(true);
              resolve();
            } catch (error: unknown) {
              rejectWithError(error);
            }
            return Promise.resolve();
          })
          .catch(rejectWithError);
      });

      await eventBus.publish('test.event', testEnvelope);
      await received;
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

  describe('LocalFeatureFlagService', () => {
    it('should resolve flags from initial configurations', async () => {
      const logger = new WinstonLogger('test-flags', 'error');
      const ffService = new LocalFeatureFlagService(logger, { 'auth.v2': true, 'billing.legacy': false });

      expect(await ffService.isEnabled('auth.v2')).toBe(true);
      expect(await ffService.isEnabled('billing.legacy')).toBe(false);
      expect(await ffService.isEnabled('unknown-flag')).toBe(false);
    });

    it('should override configured flags with environment variables', async () => {
      const logger = new WinstonLogger('test-flags', 'error');
      const ffService = new LocalFeatureFlagService(logger, { 'auth.v2': false });

      process.env.FEATURE_FLAG_AUTH_V2 = 'true';
      expect(await ffService.isEnabled('auth.v2')).toBe(true);

      delete process.env.FEATURE_FLAG_AUTH_V2;
      expect(await ffService.isEnabled('auth.v2')).toBe(false);
    });
  });
});
