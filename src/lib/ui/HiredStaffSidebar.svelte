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
	<div class="table-wrap">
		<table class="table caption-bottom">
			<caption class="pt-4">Hired Staff</caption>
			<thead>
				<tr>
					<th class="p-1 text-left">Name</th>
					<th class="p-1 text-left">Level</th>
					<th class="p-1 text-right">Wage</th>
					<th class="p-1 text-right">&nbsp;</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-tonal-secondary">
				{#each hired as h (h.id)}
					<tr>
						<th class="truncate p-1 text-sm font-medium">{h.name}</th>
						<td class="p-1 text-right text-sm tabular-nums">
							{h.level ?? '20'}
						</td>
						<td class="p-1 text-right text-sm tabular-nums">
							{h.wage.toLocaleString()}
						</td>
						<td class="p-1 text-right">
							<button
								class="btn btn-sm hover:preset-filled-tertiary-700-300"
								onclick={() => emit(h.id)}>Dismiss</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td class="p-1">&nbsp;</td>
					<td class="p-1 text-right tabular-nums">Total</td>
					<td class="p-1 text-right tabular-nums">
						{hired.reduce((acc, h) => acc + h.wage, 0).toLocaleString()}
					</td>
					<td class="p-1 text-right">&nbsp;</td>
				</tr>
			</tfoot>
		</table>
	</div>
{/if}
