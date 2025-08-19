import { createEntityStores } from './entityBundle.js';
import type { DLC } from '$lib/types.js';

export const dlcStores = createEntityStores<DLC>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = dlcStores.bundle;
export const visible = dlcStores.visible;
