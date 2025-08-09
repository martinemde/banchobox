<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
  import { Data } from '$lib/data/runtime.js';

	let { children, data }: LayoutProps = $props();
  // Initialize Data service once per render (SSR/CSR) before children render
  Data.init({
    dishes: data.dishes,
    ingredients: data.ingredients,
    parties: data.parties,
    partyDishes: data.partyDishes
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
