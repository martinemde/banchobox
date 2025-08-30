<script lang="ts">
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';
	import { partiesStores } from '$lib/stores/parties';
	import { dishesByPartyStore } from '$lib/stores/partyDishes.js';
	import PartyGroup from './PartyGroup.svelte';

	const { visible } = partiesStores;

	// Parties don't have meaningful sort options, so provide a minimal set
	const sortOptions = [{ value: 'name', label: 'Name' }];
</script>

<svelte:head>
	<title>Parties - Bancho Box</title>
	<meta
		name="description"
		content="Complete party collection from Dave the Diver with calculated profit analysis"
	/>
</svelte:head>

<EntityBundlePage
	stores={partiesStores}
	urlKey="parties"
	entityLabel="Parties"
	entityLabelPlural="parties"
	searchPlaceholder="Search parties…"
	{sortOptions}
	containerClass="parties"
>
	{#snippet content()}
		{#each $visible as party (party.id)}
			{#if $dishesByPartyStore?.[party.id]}
				<PartyGroup {party} subBundle={$dishesByPartyStore[party.id]} />
			{/if}
		{/each}
	{/snippet}
</EntityBundlePage>
