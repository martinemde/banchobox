import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

function readFromStorage(storageKey: string): number[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((n) => Number.isFinite(n));
    return [];
  } catch {
    return [];
  }
}

function writeToStorage(storageKey: string, ids: Set<number>): void {
  if (!browser) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function createTrackedIdsStore(storageKey: string): Writable<Set<number>> & {
  track: (id: number) => void;
  untrack: (id: number) => void;
  toggle: (id: number) => void;
} {
  const initial = new Set<number>(readFromStorage(storageKey));
  const store = writable<Set<number>>(initial);

  // Persist on changes
  store.subscribe((ids) => writeToStorage(storageKey, ids));

  function withClone(updateFn: (next: Set<number>) => void) {
    store.update((current) => {
      const next = new Set(current);
      updateFn(next);
      return next;
    });
  }

  function track(id: number) {
    withClone((next) => next.add(id));
  }

  function untrack(id: number) {
    withClone((next) => next.delete(id));
  }

  function toggle(id: number) {
    withClone((next) => {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    });
  }

  return Object.assign(store, { track, untrack, toggle });
}

export const trackedDishIds = createTrackedIdsStore('trackedDishIds.v1');
