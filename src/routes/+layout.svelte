<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
  import { onMount } from 'svelte';
  import { dishesStores, bundle as dishesBundleStore } from '$lib/stores/dishes';
  import { bundle as ingredientsBundleStore } from '$lib/stores/ingredients';
  import { bundle as partiesBundleStore } from '$lib/stores/parties';
  import { bundle as partyDishesBundleStore } from '$lib/stores/partyDishes';

	let { children, data }: LayoutProps = $props();
  // Initialize client stores after mount
  onMount(() => {
    if (data.dishes) {
      dishesBundleStore.set(data.dishes as any);
    }
    if (data.ingredients) {
      ingredientsBundleStore.set(data.ingredients as any);
    }
    if (data.parties) {
      partiesBundleStore.set(data.parties as any);
    }
  });

  // Re-initialize reactively if data changes after hydration
  $effect(() => {
    if (data?.dishes) {
      dishesBundleStore.set(data.dishes as any);
      if (data.ingredients) {
        ingredientsBundleStore.set(data.ingredients as any);
      }
      if (data.parties) {
        partiesBundleStore.set(data.parties as any);
      }
      if (data.partyDishes) {
        partyDishesBundleStore.set(data.partyDishes as any);
      }
    }
  });
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
