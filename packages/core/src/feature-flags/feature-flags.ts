import type { IFeatureFlagService } from './feature-flags.interface';
import type { ILogger } from '../logging/logger.interface';

export class LocalFeatureFlagService implements IFeatureFlagService {
  private readonly flags: Map<string, boolean>;
  private readonly logger: ILogger;

  constructor(logger: ILogger, initialFlags: Record<string, boolean> = {}) {
    this.logger = logger;
    this.flags = new Map<string, boolean>(Object.entries(initialFlags));
  }

  public isEnabled(flagName: string, context?: Record<string, unknown>): Promise<boolean> {
    // 1. Check environment variable override: FEATURE_FLAG_FLAG_NAME
    const envKey = `FEATURE_FLAG_${flagName.toUpperCase().replace(/[-.]/g, '_')}`;
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      const value = envValue.toLowerCase() === 'true';
      this.logger.debug(
        `Feature flag [${flagName}] resolved from env [${envKey}]: ${String(value)}`,
        { flagName, context }
      );
      return Promise.resolve(value);
    }

    // 2. Check local map
    const configuredValue = this.flags.get(flagName);
    if (configuredValue !== undefined) {
      this.logger.debug(
        `Feature flag [${flagName}] resolved from local map: ${String(configuredValue)}`,
        { flagName, context }
      );
      return Promise.resolve(configuredValue);
    }

    // 3. Default to false
    this.logger.debug(`Feature flag [${flagName}] not found, defaulting to false`, { flagName, context });
    return Promise.resolve(false);
  }

  public setFlag(flagName: string, value: boolean): void {
    this.flags.set(flagName, value);
  }

  public removeFlag(flagName: string): void {
    this.flags.delete(flagName);
  }
}
