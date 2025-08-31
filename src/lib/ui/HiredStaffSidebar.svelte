<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	let { hired = $bindable<Array<{ id: number; name: string; wage: number }>>([]) } = $props();
	const dispatch = createEventDispatcher<{ toggleHire: number }>();
	function emit(id: number) {
		dispatch('toggleHire', id);
	}
</script>

<div class="mb-2 flex items-center justify-between">
	<h2 class="text-sm font-semibold">Hired Staff</h2>
</div>

{#if hired.length === 0}
	<p class="text-sm opacity-70">
		When you click the 'Hire' button on a staff member, they will be shown here with their wage
		information. Use this to keep track of your hired staff and their costs.
	</p>
{:else}
	<ul class="space-y-2">
		{#each hired as h (h.id)}
			<li class="rounded-lg border border-surface-500 p-2">
				<div class="truncate text-sm font-medium">{h.name}</div>
				<div class="mt-1 flex items-center justify-between text-xs opacity-70">
					<span>Wage {h.wage.toLocaleString()}</span>
					<button class="underline" onclick={() => emit(h.id)}>Unhire</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}
