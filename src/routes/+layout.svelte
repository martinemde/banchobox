<script lang="ts">
	import Header from './Header.svelte';
	import AnchorHandler from '$lib/ui/AnchorHandler.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { bundle as dishesBundleStore } from '$lib/stores/dishes';
	import { bundle as ingredientsBundleStore } from '$lib/stores/ingredients';
	import { bundle as partiesBundleStore } from '$lib/stores/parties';
	import { bundle as partyDishesBundleStore } from '$lib/stores/partyDishes';
	import { cookstaTiers } from '$lib/stores/cooksta';
	import { dlcs } from '$lib/stores/dlc';
	import { chapters } from '$lib/stores/chapters';
	import { bundle as staffBundleStore } from '$lib/stores/staff';
	import type {
		EntityBundle,
		Dish,
		Ingredient,
		Party,
		PartyDish,
		CookstaTier,
		DLC,
		Chapter,
		Staff
	} from '$lib/types.js';

	let { children, data }: LayoutProps = $props();

	// Initialize stores - runs once per component instance
	// Using $effect.pre to run before DOM updates and avoid hydration issues
	$effect.pre(() => {
		// Set stores directly from data - no need to check if null
		// This ensures stores are always in sync with server data
		dishesBundleStore.set(data.dishes as EntityBundle<Dish>);
		ingredientsBundleStore.set(data.ingredients as EntityBundle<Ingredient>);
		partiesBundleStore.set(data.parties as EntityBundle<Party>);
		partyDishesBundleStore.set(data.partyDishes as EntityBundle<PartyDish>);
		cookstaTiers.set(data.cooksta as CookstaTier[]);
		dlcs.set(data.dlc as DLC[]);
		chapters.set(data.chapters as Chapter[]);
		staffBundleStore.set(data.staff as EntityBundle<Staff>);
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<AnchorHandler />

	<main class="w-full flex-1">
		{@render children()}
	</main>
</div>
