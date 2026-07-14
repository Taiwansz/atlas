export interface IFeatureFlagService {
  isEnabled(flagName: string, context?: Record<string, unknown>): Promise<boolean>;
}
