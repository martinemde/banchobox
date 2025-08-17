/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

// Minimal SvelteKit client globals for route component tests
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __SVELTEKIT_PAYLOAD__: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    __SVELTEKIT_PAYLOAD__?: any;
  }
}

if (typeof globalThis.__SVELTEKIT_PAYLOAD__ === 'undefined') {
  // SvelteKit client.js expects this to exist; keep it minimal
  // @ts-expect-error - injected global for tests
  globalThis.__SVELTEKIT_PAYLOAD__ = { data: {} };
}
