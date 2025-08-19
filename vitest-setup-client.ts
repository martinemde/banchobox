/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

// Minimal SvelteKit client globals for route component tests
declare global {
	interface Window {
		__SVELTEKIT_PAYLOAD__?: unknown;
	}
	var __SVELTEKIT_PAYLOAD__: unknown | undefined;
}

if (typeof globalThis.__SVELTEKIT_PAYLOAD__ === 'undefined') {
	// SvelteKit client.js expects this to exist; keep it minimal
	globalThis.__SVELTEKIT_PAYLOAD__ = { data: {} };
}
