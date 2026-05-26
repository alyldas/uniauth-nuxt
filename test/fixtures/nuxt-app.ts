import { ref, type Ref } from "vue";

interface AsyncDataOptions<T> {
  readonly default?: () => T;
  readonly transform?: (value: T) => T;
}

interface RuntimeConfig {
  public: {
    uniauth?: {
      proxyPrefix?: string;
      redirects?: {
        signIn?: string;
      };
    };
  };
}

const states = new Map<string, Ref<unknown>>();
let runtimeConfig: RuntimeConfig = {
  public: {},
};
let lastNavigation: string | null = null;

export function resetNuxtAppFixture(): void {
  states.clear();
  runtimeConfig = {
    public: {},
  };
  lastNavigation = null;
}

export function setRuntimeConfig(config: RuntimeConfig): void {
  runtimeConfig = config;
}

export function getLastNavigation(): string | null {
  return lastNavigation;
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function useAsyncData<T>(
  _key: string,
  handler: () => Promise<T>,
  options: AsyncDataOptions<T> = {},
) {
  const data = ref<T>(options.default?.() as T);
  const pending = ref(false);
  const error = ref<unknown>(null);

  async function refresh(): Promise<void> {
    pending.value = true;
    error.value = null;

    try {
      const value = await handler();
      data.value = options.transform?.(value) ?? value;
    } catch (caughtError) {
      error.value = caughtError;
      throw caughtError;
    } finally {
      pending.value = false;
    }
  }

  function clear(): void {
    data.value = options.default?.() as T;
    error.value = null;
  }

  return {
    data,
    pending,
    error,
    refresh,
    clear,
  };
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function useRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function useState<T>(key: string, init: () => T): Ref<T> {
  if (!states.has(key)) {
    states.set(key, ref(init()));
  }

  return states.get(key) as Ref<T>;
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function createError(options: {
  readonly statusCode: number;
  readonly statusMessage: string;
}): Error {
  return Object.assign(new Error(options.statusMessage), options);
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function defineNuxtRouteMiddleware<T>(middleware: () => T): () => T {
  return middleware;
}

// noinspection JSUnusedGlobalSymbols -- Vitest resolves Nuxt #app imports to this fixture.
export function navigateTo(to: string): string {
  lastNavigation = to;
  return to;
}
