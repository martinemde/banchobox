export class LocalStore<T> {
	#key: string;
	#state: T; // <- the actual reactive state

	constructor(key: string, defaultValue: T) {
		this.#key = key;

		const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;

		// Initialize once from localStorage (or default)
		this.#state = $state(stored ? JSON.parse(stored) : defaultValue);

		if (typeof window !== 'undefined') {
			const resync = () => {
				const s = localStorage.getItem(this.#key);
				if (s != null) this.#state = JSON.parse(s);
			};

			// Cross-tab sync
			window.addEventListener('storage', (e) => {
				if (e.storageArea === localStorage && e.key === this.#key) resync();
			});

			// BFCache restore (iOS/Safari etc.)
			window.addEventListener('pageshow', (e: PageTransitionEvent) => {
				if (e.persisted) resync();
			});
		}
	}

	// Private method to persist to localStorage
	#persist() {
		if (typeof localStorage !== 'undefined') {
			const snapshot = JSON.stringify(this.#state);
			localStorage.setItem(this.#key, snapshot);
		}
	}

	// Public, reactive value
	get value(): T {
		return this.#state; // reading tracks
	}
	set value(v: T) {
		this.#state = v; // assignment updates reactive state
		this.#persist(); // immediately persist to localStorage
	}
}
