<script lang="ts">
	import PartyDish from '$lib/components/PartyDishCard.svelte';
	import { createPartyDishesStores } from '$lib/stores/partyDishes.js';
	import type { EnrichedParty, Id, PartyDish as PartyDishRow } from '$lib/types.js';
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';

	export let party: EnrichedParty;
	export let subBundle: {
		rows: PartyDishRow[];
		byId: Record<Id, PartyDishRow>;
		facets: Record<string, Record<string, Id[]>>;
	};

	const stores = createPartyDishesStores(subBundle);
	const visibleStore = stores.visible;
</script>

<section class="mt-6">
	<header class="flex items-center justify-between border-b border-surface-200-800 py-3">
		<h3 class="m-0 h4">{party.name} Party</h3>
		<div class="flex items-center gap-2">
			<span class="badge preset-filled-primary-500 text-xs">{party.bonus}× bonus</span>
			<span class="text-sm opacity-80">{party.partyDishIds.length} dishes</span>
		</div>
	</header>

	<div class="flex flex-col gap-y-4">
		{#each $visibleStore as pd (pd.id)}
			{@const dish = $dishesBundle?.byId[pd.dishId]}
			{#if dish}
				<PartyDish {dish} partyDish={pd} {party} />
			{/if}
		{/each}
	</div>
</section>

<style>
</style>
