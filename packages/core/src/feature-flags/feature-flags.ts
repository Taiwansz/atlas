import { IFeatureFlagService } from './feature-flags.interface';
import { ILogger } from '../logging/logger.interface';

export class LocalFeatureFlagService implements IFeatureFlagService {
  private readonly flags: Map<string, boolean>;
  private readonly logger: ILogger;

  constructor(logger: ILogger, initialFlags: Record<string, boolean> = {}) {
    this.logger = logger;
    this.flags = new Map<string, boolean>(Object.entries(initialFlags));
  }

  public async isEnabled(flagName: string, context?: Record<string, any>): Promise<boolean> {
    // 1. Check environment variable override: FEATURE_FLAG_FLAG_NAME
    const envKey = `FEATURE_FLAG_${flagName.toUpperCase().replace(/[-.]/g, '_')}`;
    if (process.env[envKey] !== undefined) {
      const val = process.env[envKey]?.toLowerCase() === 'true';
      this.logger.debug(`Feature flag [${flagName}] resolved from env [${envKey}]: ${val}`, { flagName, context });
      return val;
    }

    // 2. Check local map
    if (this.flags.has(flagName)) {
      const val = this.flags.get(flagName)!;
      this.logger.debug(`Feature flag [${flagName}] resolved from local map: ${val}`, { flagName, context });
      return val;
    }

    // 3. Default to false
    this.logger.debug(`Feature flag [${flagName}] not found, defaulting to false`, { flagName, context });
    return false;
  }

  public setFlag(flagName: string, value: boolean): void {
    this.flags.set(flagName, value);
  }

  public removeFlag(flagName: string): void {
    this.flags.delete(flagName);
  }
}
