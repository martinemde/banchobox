import { browser } from '$app/environment';
import { untrack } from 'svelte';

export type PersistOptions<T> = {
	serialize?: (value: T) => string;
	deserialize?: (raw: string) => T;
	syncTabs?: boolean;
	version?: string; // Add versioning support
};

function createStorageKey(key: string, version?: string): string {
	return version ? `${key}.${version}` : key;
}

export function persistedState<T>(
	key: string,
	initialValue: T,
	options?: PersistOptions<T>
): { get: () => T; set: (value: T) => void } {
	const storageKey = createStorageKey(key, options?.version);
	let initialized = false;

	function readFromStorage(): T | undefined {
		if (!browser) return undefined;
		const raw = localStorage.getItem(storageKey);
		if (raw == null) return undefined;
		try {
			return options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T);
		} catch {
			return undefined;
		}
	}

	function writeToStorage(value: T) {
		if (!browser) return;
		try {
			const raw = options?.serialize ? options.serialize(value) : JSON.stringify(value);
			localStorage.setItem(storageKey, raw);
		} catch {
			/* ignore quota/serialization errors */
		}
	}

	// Initialize state with value from storage or initial value
	const persisted = browser ? readFromStorage() : undefined;
	let state = $state(persisted !== undefined ? persisted : initialValue);

	// Only write to storage when state changes after initialization
	$effect(() => {
		if (!browser) return;
		if (!initialized) {
			initialized = true;
			return; // Skip first run to avoid writing initial value back
		}
		writeToStorage(state);
	});

	// Tab synchronization with proper cleanup
	if (browser && (options?.syncTabs ?? true)) {
		$effect(() => {
			function onStorage(e: StorageEvent) {
				if (e.storageArea !== localStorage) return;
				if (e.key !== storageKey) return;
				if (e.newValue == null) return;
				try {
					// Use untrack to avoid triggering the write effect
					untrack(() => {
						state = options?.deserialize
							? options.deserialize(e.newValue!)
							: (JSON.parse(e.newValue!) as T);
					});
				} catch {
					/* noop */
				}
			}

			addEventListener('storage', onStorage);
			return () => removeEventListener('storage', onStorage);
		});
	}

	return {
		get: () => state,
		set: (value: T) => (state = value)
	};
}

/**
 * Synchronize an existing `$state` variable to localStorage.
 * Use this when you need the variable itself to be reactive in the caller.
 */
export function persist<T>(
	key: string,
	getValue: () => T,
	setValue: (value: T) => void,
	options?: PersistOptions<T>
): void {
	const storageKey = createStorageKey(key, options?.version);
	let initialized = false;

	function readFromStorage(): T | undefined {
		if (!browser) return undefined;
		const raw = localStorage.getItem(storageKey);
		if (raw == null) return undefined;
		try {
			return options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T);
		} catch {
			return undefined;
		}
	}

	function writeToStorage(value: T) {
		if (!browser) return;
		try {
			const raw = options?.serialize ? options.serialize(value) : JSON.stringify(value);
			localStorage.setItem(storageKey, raw);
		} catch {
			/* ignore */
		}
	}

	// Initialize from storage if available
	if (browser) {
		const persisted = readFromStorage();
		if (persisted !== undefined) setValue(persisted);
	}

	// Persist changes, but skip initial write
	$effect(() => {
		if (!browser) return;
		if (!initialized) {
			initialized = true;
			return;
		}
		writeToStorage(getValue());
	});

	// Tab synchronization
	if (browser && (options?.syncTabs ?? true)) {
		$effect(() => {
			function onStorage(e: StorageEvent) {
				if (e.storageArea !== localStorage) return;
				if (e.key !== storageKey) return;
				if (e.newValue == null) return;
				try {
					setValue(
						options?.deserialize ? options.deserialize(e.newValue) : (JSON.parse(e.newValue) as T)
					);
				} catch {
					/* noop */
				}
			}

			addEventListener('storage', onStorage);
			return () => removeEventListener('storage', onStorage);
		});
	}
}

// Convenience helper with default versioning
export function persistedLocalState<T>(
	key: string,
	initialValue: T,
	options?: PersistOptions<T>
): { get: () => T; set: (value: T) => void } {
	return persistedState(key, initialValue, {
		...options,
		version: options?.version ?? 'v1' // Default versioning
	});
}
