import { writable } from 'svelte/store';
import type { DLC } from '$lib/types.js';

export const dlcs = writable<DLC[]>([]);
