export type ServiceToken<T> = string | symbol;

export type ServiceFactory<T> = () => T;

export class ServiceContainer {
  private static singleton: ServiceContainer | null = null;

  public static get instance(): ServiceContainer {
    if (!ServiceContainer.singleton) {
      ServiceContainer.singleton = new ServiceContainer();
    }
    return ServiceContainer.singleton;
  }

  private readonly factories = new Map<ServiceToken<unknown>, ServiceFactory<unknown>>();
  private readonly singletons = new Map<ServiceToken<unknown>, unknown>();

  public register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>, { singleton = true } = {}): void {
    this.factories.set(token, factory);
    if (!singleton) {
      this.singletons.delete(token);
    }
  }

  public resolve<T>(token: ServiceToken<T>): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`Service with token "${String(token)}" is not registered.`);
    }

    const instance = factory() as T;
    this.singletons.set(token, instance);
    return instance;
  }

  public reset(): void {
    this.factories.clear();
    this.singletons.clear();
  }
}
