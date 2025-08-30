<script lang="ts">
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import { partiesStores } from '$lib/stores/parties';
	import { dishesByPartyStore } from '$lib/stores/partyDishes.js';
	import PartyGroup from './PartyGroup.svelte';

	const { query, sortKey, sortDir, visible, filters, bundle, baselineFilters } = partiesStores;
</script>

<svelte:head>
	<title>Parties - Bancho Box</title>
	<meta
		name="description"
		content="Complete party collection from Dave the Diver with calculated profit analysis"
	/>
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="parties">
	{#snippet left()}
		<FiltersPanel
			{bundle}
			{filters}
			{baselineFilters}
			bind:query={$query}
			bind:sortKey={$sortKey as string}
			bind:sortDir={$sortDir}
			searchPlaceholder="Search parties…"
		/>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-4">
			{#each $visible as party (party.id)}
				{#if $dishesByPartyStore?.[party.id]}
					<PartyGroup {party} subBundle={$dishesByPartyStore[party.id]} />
				{/if}
			{/each}
		</div>
	{/snippet}
</ResponsiveLayout>
