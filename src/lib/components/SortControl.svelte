<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ArrowDown, ArrowUp } from '@lucide/svelte';

	type SortDirection = 'asc' | 'desc';
	interface SortOption {
		value: string;
		label: string;
	}

	export let options: SortOption[] = [];
	export let column: string;
	export let direction: SortDirection = 'asc';

	const dispatch = createEventDispatcher<{
		change: { column: string; direction: SortDirection };
	}>();

	function toggleDirection() {
		direction = direction === 'asc' ? 'desc' : 'asc';
		dispatch('change', { column, direction });
	}

	function handleSelectChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		column = target.value;
		dispatch('change', { column, direction });
	}
</script>

<div class="input-group inline-grid w-auto grid-cols-[auto_auto]">
	<button
		type="button"
		class="ig-cell cursor-pointer preset-tonal select-none"
		aria-label="Toggle sort direction"
		title={direction === 'asc' ? 'Ascending' : 'Descending'}
		on:click={toggleDirection}
	>
		{#if direction === 'asc'}
			<ArrowUp size={16} />
		{:else}
			<ArrowDown size={16} />
		{/if}
	</button>

	<select
		class="ig-select w-auto"
		bind:value={column}
		on:change={handleSelectChange}
		aria-label="Sort by"
	>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
