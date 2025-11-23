<script lang="ts">
	import { ChevronDown, Filter } from '@lucide/svelte';

	let {
		facets,
		activeFacets = {},
		onUpdate,
		expanded = $bindable(false)
	}: {
		facets: Record<string, Record<string, number[]>>;
		activeFacets?: Record<string, string[]>;
		onUpdate: (category: string, values: string[]) => void;
		expanded?: boolean;
	} = $props();

	function toggleFacet(category: string, value: string) {
		const current = activeFacets[category] ?? [];
		let updated: string[];

		if (current.includes(value)) {
			updated = current.filter((v) => v !== value);
		} else {
			updated = [...current, value];
		}

		onUpdate(category, updated);
	}

	function clearCategory(category: string) {
		onUpdate(category, []);
	}

	function clearAll() {
		for (const category of Object.keys(facets)) {
			onUpdate(category, []);
		}
	}

	const hasActiveFilters = $derived(
		Object.values(activeFacets).some((values) => values.length > 0)
	);

	const activeFilterCount = $derived(
		Object.values(activeFacets).reduce((sum, values) => sum + values.length, 0)
	);
</script>

<div class="rounded-lg border border-surface-200-800 bg-surface-50-950">
	<button
		type="button"
		onclick={() => (expanded = !expanded)}
		class="flex w-full items-center justify-between gap-2 p-4 text-left transition-colors hover:bg-surface-100-900"
		aria-expanded={expanded}
		aria-controls="facet-panel"
	>
		<div class="flex items-center gap-2">
			<Filter size={18} />
			<span class="font-semibold">Filters</span>
			{#if activeFilterCount > 0}
				<span class="badge preset-filled-primary-500 text-xs">{activeFilterCount}</span>
			{/if}
		</div>
		<ChevronDown
			size={18}
			class="transition-transform {expanded ? 'rotate-180' : ''}"
		/>
	</button>

	{#if expanded}
		<div id="facet-panel" class="border-t border-surface-200-800 p-4">
			{#if hasActiveFilters}
				<button
					type="button"
					onclick={clearAll}
					class="btn preset-tonal-error mb-4 w-full text-sm"
				>
					Clear all filters
				</button>
			{/if}

			<div class="space-y-6">
				{#each Object.entries(facets) as [category, values] (category)}
					<div>
						<div class="mb-2 flex items-center justify-between">
							<h3 class="text-sm font-semibold uppercase tracking-wide opacity-70">
								{category}
							</h3>
							{#if activeFacets[category]?.length > 0}
								<button
									type="button"
									onclick={() => clearCategory(category)}
									class="text-xs opacity-60 hover:opacity-100"
								>
									Clear
								</button>
							{/if}
						</div>

						<div class="space-y-2">
							{#each Object.entries(values) as [value, ids] (value)}
								{@const count = ids.length}
								{@const isActive = activeFacets[category]?.includes(value) ?? false}

								<label class="flex cursor-pointer items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={isActive}
										onchange={() => toggleFacet(category, value)}
										class="checkbox"
									/>
									<span class="flex-1">{value}</span>
									<span class="tabular-nums opacity-60">({count})</span>
								</label>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
