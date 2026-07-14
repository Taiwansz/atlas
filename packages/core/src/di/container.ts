export class Container {
  private static readonly instances = new Map<string, unknown>();
  private static readonly factories = new Map<string, () => unknown>();

  public static register<T>(token: string, instance: T): void {
    this.instances.set(token, instance);
  }

  public static registerFactory<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  public static resolve<T>(token: string): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (factory) {
      const instance = factory();
      this.instances.set(token, instance); // Cache singleton from factory
      return instance as T;
    }
    throw new Error(`Dependency injection token not registered: ${token}`);
  }

  public static clear(): void {
    this.instances.clear();
    this.factories.clear();
  }
}
