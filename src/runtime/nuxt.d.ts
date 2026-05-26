declare module "#app" {
  import type { Ref } from "vue";

  interface NuxtErrorOptions {
    readonly statusCode: number;
    readonly statusMessage: string;
  }

  interface AsyncData<T> {
    readonly data: Ref<T>;
    readonly pending: Ref<boolean>;
    readonly error: Ref<unknown>;
    refresh(): Promise<void>;
    clear(): void;
  }

  export function useAsyncData<T>(
    key: string,
    handler: () => Promise<T>,
    options?: {
      default?: () => T;
      transform?: (value: T) => T;
    },
  ): AsyncData<T>;

  export function useRuntimeConfig(): {
    public: {
      uniauth?: {
        proxyPrefix?: string;
        redirects?: {
          signIn?: string;
        };
      };
    };
  };

  export function createError(options: NuxtErrorOptions): Error;
  export function defineNuxtRouteMiddleware<T>(middleware: () => T): () => T;
  export function navigateTo(to: string): unknown;
  export function useState<T>(key: string, init: () => T): Ref<T>;
}

declare const $fetch: typeof import("ofetch").$fetch;
