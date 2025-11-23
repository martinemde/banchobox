<script lang="ts">
	import { ArrowUp, ArrowDown } from '@lucide/svelte';

	let {
		field,
		direction,
		fields,
		onUpdate
	}: {
		field: string;
		direction: 'asc' | 'desc';
		fields: Array<{ value: string; label: string }>;
		onUpdate: (field: string, direction: 'asc' | 'desc') => void;
	} = $props();

	function toggleDirection() {
		const newDir = direction === 'asc' ? 'desc' : 'asc';
		onUpdate(field, newDir);
	}

	function handleFieldChange(e: Event) {
		const newField = (e.target as HTMLSelectElement).value;
		onUpdate(newField, direction);
	}
</script>

<div class="flex items-center gap-2">
	<label class="flex-1">
		<span class="sr-only">Sort by</span>
		<select value={field} onchange={handleFieldChange} class="ig-select w-full">
			{#each fields as sortField (sortField.value)}
				<option value={sortField.value}>{sortField.label}</option>
			{/each}
		</select>
	</label>

	<button
		type="button"
		onclick={toggleDirection}
		class="btn preset-tonal-surface-500 flex items-center gap-2 px-4"
		aria-label={direction === 'asc' ? 'Ascending order' : 'Descending order'}
	>
		{#if direction === 'asc'}
			<ArrowUp size={18} />
			<span class="hidden sm:inline">Asc</span>
		{:else}
			<ArrowDown size={18} />
			<span class="hidden sm:inline">Desc</span>
		{/if}
	</button>
</div>
