<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { get } from 'svelte/store';
	import { bundle as dishesBundleStore } from '$lib/stores/dishes';
	import { bundle as ingredientsBundleStore } from '$lib/stores/ingredients';
	import { bundle as partiesBundleStore } from '$lib/stores/parties';
	import { bundle as partyDishesBundleStore } from '$lib/stores/partyDishes';
	import type { EntityBundle, Dish, Ingredient, Party, PartyDish } from '$lib/types.js';

	let { children, data }: LayoutProps = $props();
	// One-time initialization (works in SSR and client): set only if store is empty
	if (data.dishes && get(dishesBundleStore) == null) {
		dishesBundleStore.set(data.dishes as EntityBundle<Dish>);
	}
	if (data.ingredients && get(ingredientsBundleStore) == null) {
		ingredientsBundleStore.set(data.ingredients as EntityBundle<Ingredient>);
	}
	if (data.parties && get(partiesBundleStore) == null) {
		partiesBundleStore.set(data.parties as EntityBundle<Party>);
	}
	if (data.partyDishes && get(partyDishesBundleStore) == null) {
		partyDishesBundleStore.set(data.partyDishes as EntityBundle<PartyDish>);
	}
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		width: 100%;
	}
</style>
