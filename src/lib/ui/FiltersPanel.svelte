<script lang="ts">
  import SortControl from '$lib/ui/SortControl.svelte';
  import type { Readable, Writable } from 'svelte/store';
  import type { EntityBundle, Id } from '$lib/types.js';

  const defaultSortOptions = [
    { value: 'name', label: 'Recipe' },
    { value: 'finalPrice', label: 'Final Price' },
    { value: 'finalServings', label: 'Final Servings' },
    { value: 'finalProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
    { value: 'ingredientCount', label: 'Ingredients' },
  ];

  let {
    bundle,
    filters,
    query = $bindable(''),
    sortKey = $bindable<string>('finalProfitPerServing'),
    sortDir = $bindable<'asc'|'desc'>('desc'),
    sortOptions,
    searchPlaceholder
  }: {
    bundle: Readable<EntityBundle<any> | null>;
    filters: Writable<Record<string, Set<string>>>;
    query?: string;
    sortKey?: string;
    sortDir?: 'asc'|'desc';
    sortOptions?: Array<{ value: string; label: string }>;
    searchPlaceholder?: string;
  } = $props();

  function formatFacetTitle(key: string): string {
    // Simple title-case; customize as needed
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/^./, (c) => c.toUpperCase());
  }

  function isChecked(facet: string, value: string): boolean {
    return Boolean($filters?.[facet]?.has(value));
  }

  function toggleFacet(facet: string, value: string, checked: boolean) {
    filters.update((current: Record<string, Set<string>>) => {
      const next: Record<string, Set<string>> = { ...current };
      const set = new Set(next[facet] ?? []);
      if (checked) set.add(value); else set.delete(value);
      if (set.size > 0) next[facet] = set; else delete next[facet];
      return next;
    });
  }

  const effectiveSortOptions = sortOptions ?? defaultSortOptions;
  const effectivePlaceholder = searchPlaceholder ?? 'Search by name…';
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <label class="text-sm font-semibold" for="filters-search">Search</label>
    <div class="relative">
      <input
        type="search"
        id="filters-search"
        class="search-input w-full"
        placeholder={effectivePlaceholder}
        bind:value={query}
      />
      {#if query}
        <button class="clear-btn" aria-label="Clear search" onclick={() => (query = '')}>×</button>
      {/if}
    </div>
  </div>

  <div class="space-y-2">
    <SortControl
      options={effectiveSortOptions}
      bind:column={sortKey}
      bind:direction={sortDir}
    />
  </div>

  {#each Object.entries(($bundle?.facets ?? {})) as [facetName, facetIndex]}
    <fieldset class="space-y-1">
      <legend class="text-sm font-semibold">{formatFacetTitle(facetName)}</legend>
      {#each Object.keys(facetIndex as Record<string, Id[]>).sort((a, b) => a.localeCompare(b)) as key}
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isChecked(facetName, key)}
            onchange={(e) => toggleFacet(facetName, key, (e.currentTarget as HTMLInputElement).checked)}
          />
          {key}
        </label>
      {/each}
    </fieldset>
  {/each}
</div>

<style>
  .search-input {
    padding: 0.6rem 2rem 0.6rem 0.8rem;
    border: 1px solid rgb(var(--color-surface-300));
    border-radius: 0.5rem;
    background-color: rgb(var(--color-surface-50));
    color: rgb(var(--color-on-surface-token));
    caret-color: rgb(var(--color-primary-500));
    transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
  }
  .search-input::placeholder {
    color: rgb(var(--color-on-surface-token) / 0.55);
  }
  .search-input:hover {
    background-color: rgb(var(--color-surface-100));
    border-color: rgb(var(--color-surface-400));
  }
  .search-input:focus,
  .search-input:focus-visible {
    outline: none;
    background-color: rgb(var(--color-surface-50));
    border-color: rgb(var(--color-primary-500));
    box-shadow: 0 0 0 3px rgb(var(--color-primary-500) / 0.25);
  }
  .clear-btn {
    position: absolute;
    right: 0.35rem;
    top: 50%;
    transform: translateY(-50%);
    line-height: 1;
    border: none;
    background: transparent;
    color: rgb(var(--color-on-surface-token));
    font-size: 1.25rem;
    padding: 0 0.25rem;
    cursor: pointer;
    opacity: 0.7;
    transition: color 150ms ease, opacity 150ms ease;
  }
  .clear-btn:hover {
    opacity: 1;
    color: rgb(var(--color-on-surface-token));
  }
</style>
