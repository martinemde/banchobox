<script lang="ts">
	import { ArrowDown, ArrowUp } from '@lucide/svelte';

	type SortDirection = 'asc' | 'desc';
	interface SortOption {
		value: string;
		label: string;
	}

	let {
		options = [],
		column = $bindable(''),
		direction = $bindable<SortDirection>('asc')
	} = $props();

	function toggleDirection() {
		direction = direction === 'asc' ? 'desc' : 'asc';
	}

	function handleSelectChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		column = target.value;
	}
</script>

<div class="input-group inline-grid w-auto grid-cols-[auto_auto]">
	<button
		type="button"
		class="ig-cell cursor-pointer preset-tonal select-none"
		aria-label="Toggle sort direction"
		title={direction === 'asc' ? 'Ascending' : 'Descending'}
		onclick={toggleDirection}
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
		onchange={handleSelectChange}
		aria-label="Sort by"
	>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
