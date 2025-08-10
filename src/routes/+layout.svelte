<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
  import { Data } from '$lib/data/runtime.js';
  import { onMount } from 'svelte';
  import { dishesStores } from '$lib/stores/dishes';

	let { children, data }: LayoutProps = $props();
  // Initialize Data service on the client after mount to avoid SSR undefined data
  onMount(() => {
    Data.init({
      dishes: (data.dishesBundle?.rows ?? []) as any,
      ingredients: data.ingredients ?? [],
      parties: data.parties ?? [],
      partyDishes: data.partyDishes ?? []
    });
    if (data.dishesBundle) {
      dishesStores.bundle.set(data.dishesBundle as any);
    }
  });

  // Re-initialize reactively if data changes after hydration
  $effect(() => {
    if (data?.dishesBundle) {
      Data.init({
        dishes: (data.dishesBundle.rows ?? []) as any,
        ingredients: data.ingredients ?? [],
        parties: data.parties ?? [],
        partyDishes: data.partyDishes ?? []
      });
      dishesStores.bundle.set(data.dishesBundle as any);
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
