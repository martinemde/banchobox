import { browser } from '$app/environment';
import { onMount } from 'svelte';

export type PersistOptions<T> = {
	serialize?: (value: T) => string;
	deserialize?: (raw: string) => T;
	storage?: 'local' | 'session';
	syncTabs?: boolean;
};

function selectStorage(kind: 'local' | 'session'): Storage | null {
	if (!browser) return null;
	return kind === 'local' ? localStorage : sessionStorage;
}

export function persistedState<T>(
	key: string,
	initialValue: T,
	options?: PersistOptions<T>
): { get: () => T; set: (value: T) => void } {
	const storageKind = options?.storage ?? 'local';
	let state = $state(initialValue);

	function readFromStorage(): T | undefined {
		const storage = selectStorage(storageKind);
		if (!storage) return undefined;
		const raw = storage.getItem(key);
		if (raw == null) return undefined;
		try {
			return options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T);
		} catch {
			return undefined;
		}
	}

	function writeToStorage(value: T) {
		const storage = selectStorage(storageKind);
		if (!storage) return;
		try {
			const raw = options?.serialize ? options.serialize(value) : JSON.stringify(value);
			storage.setItem(key, raw);
		} catch {
			/* ignore quota/serialization errors */
		}
	}

	if (browser) {
		const persisted = readFromStorage();
		if (persisted !== undefined) {
			state = persisted as T;
		}
	}

	$effect(() => {
		if (!browser) return;
		writeToStorage(state as T);
	});

	const shouldSyncTabs = options?.syncTabs ?? true;
	if (browser && shouldSyncTabs && storageKind === 'local') {
		onMount(() => {
			function onStorage(e: StorageEvent) {
				const storage = selectStorage(storageKind);
				if (!storage) return;
				if (e.storageArea !== storage) return;
				if (e.key !== key) return;
				if (e.newValue == null) return;
				try {
					state = options?.deserialize
						? options.deserialize(e.newValue)
						: (JSON.parse(e.newValue) as T);
				} catch {
					/* noop */
				}
			}
			addEventListener('storage', onStorage);
			return () => removeEventListener('storage', onStorage);
		});
	}

	return {
		get: () => state as T,
		set: (value: T) => (state = value)
	};
}

/**
 * Synchronize an existing `$state` variable to Web Storage.
 * Use this when you need the variable itself to be reactive in the caller.
 */
export function persist<T>(
	key: string,
	getValue: () => T,
	setValue: (value: T) => void,
	options?: PersistOptions<T>
): void {
	const storageKind = options?.storage ?? 'local';

	function readFromStorage(): T | undefined {
		const storage = selectStorage(storageKind);
		if (!storage) return undefined;
		const raw = storage.getItem(key);
		if (raw == null) return undefined;
		try {
			return options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T);
		} catch {
			return undefined;
		}
	}

	function writeToStorage(value: T) {
		const storage = selectStorage(storageKind);
		if (!storage) return;
		try {
			const raw = options?.serialize ? options.serialize(value) : JSON.stringify(value);
			storage.setItem(key, raw);
		} catch {
			/* ignore */
		}
	}

	if (browser) {
		const persisted = readFromStorage();
		if (persisted !== undefined) setValue(persisted);
	}

	$effect(() => {
		if (!browser) return;
		writeToStorage(getValue());
	});

	const shouldSyncTabs = options?.syncTabs ?? true;
	if (browser && shouldSyncTabs && storageKind === 'local') {
		onMount(() => {
			function onStorage(e: StorageEvent) {
				const storage = selectStorage(storageKind);
				if (!storage) return;
				if (e.storageArea !== storage) return;
				if (e.key !== key) return;
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

export function persistedLocalState<T>(
	key: string,
	initialValue: T,
	options?: Omit<PersistOptions<T>, 'storage'>
): { get: () => T; set: (value: T) => void } {
	return persistedState(key, initialValue, { ...options, storage: 'local' });
}

export function persistedSessionState<T>(
	key: string,
	initialValue: T,
	options?: Omit<PersistOptions<T>, 'storage' | 'syncTabs'>
): { get: () => T; set: (value: T) => void } {
	return persistedState(key, initialValue, { ...options, storage: 'session', syncTabs: false });
}
