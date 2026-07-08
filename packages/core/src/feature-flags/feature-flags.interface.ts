export interface IFeatureFlagService {
  isEnabled(flagName: string, context?: Record<string, any>): Promise<boolean>;
}
