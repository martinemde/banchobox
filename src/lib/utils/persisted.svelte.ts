import { browser } from '$app/environment';

export type PersistOptions<T> = {
	serialize?: (value: T) => string;
	deserialize?: (raw: string) => T;
	syncTabs?: boolean;
	version?: string; // Add versioning support
};

function createStorageKey(key: string, version?: string): string {
	return version ? `${key}.${version}` : key;
}

export type PersistedStore<T> = {
	get: () => T;
	set: (value: T) => void;
	update: (fn: (value: T) => T) => void;
	subscribe: (run: (value: T) => void) => () => void;
};

export function persistedState<T>(
	key: string,
	initialValue: T,
	options?: PersistOptions<T>
): PersistedStore<T> {
	const storageKey = createStorageKey(key, options?.version);

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
	// Use plain variable instead of $state since we're managing reactivity through subscribers
	const persisted = browser ? readFromStorage() : undefined;
	let state = persisted !== undefined ? persisted : initialValue;

	// Track subscribers for store contract
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Using plain Set for internal subscriber tracking
	const subscribers = new Set<(value: T) => void>();

	// Notify all subscribers when state changes
	function notifySubscribers() {
		subscribers.forEach((fn) => fn(state));
	}

	// Tab synchronization - set up storage listener directly (not in an effect)
	if (browser && (options?.syncTabs ?? true)) {
		function onStorage(e: StorageEvent) {
			if (e.storageArea !== localStorage) return;
			if (e.key !== storageKey) return;
			if (e.newValue == null) return;
			try {
				state = options?.deserialize
					? options.deserialize(e.newValue!)
					: (JSON.parse(e.newValue!) as T);
				// Notify subscribers of the change from storage event
				notifySubscribers();
			} catch {
				/* noop */
			}
		}

		addEventListener('storage', onStorage);
	}

	return {
		get: () => state,
		set: (value: T) => {
			state = value;
			// Write to storage and notify subscribers
			writeToStorage(value);
			notifySubscribers();
		},
		update: (fn: (value: T) => T) => {
			state = fn(state);
			// Write to storage and notify subscribers
			writeToStorage(state);
			notifySubscribers();
		},
		subscribe: (run: (value: T) => void) => {
			subscribers.add(run);
			run(state); // Call immediately with current value (Svelte store contract)
			return () => subscribers.delete(run);
		}
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
): PersistedStore<T> {
	return persistedState(key, initialValue, {
		...options,
		version: options?.version ?? 'v1' // Default versioning
	});
}
