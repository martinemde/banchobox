<script lang="ts">
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';
	import { bundle as ingredientsBundle } from '$lib/stores/ingredients.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';

	$: dishes = $dishesBundle?.rows ?? [];
	$: ingredients = $ingredientsBundle?.rows ?? [];
	$: parties = $partiesBundle?.rows ?? [];
</script>

<svelte:head>
	<title>Bancho Box - A Dave the Diver Almanac</title>
	<meta
		name="description"
		content="Complete dish, ingredient and party collection from Dave the Diver"
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-6xl font-bold text-primary-500">Bancho Box</h1>
		<p class="text-on-surface-token mx-auto max-w-2xl text-xl">A Dave the Diver Almanac</p>
	</div>

	<div class="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
		<!-- Dishes Card -->
		<a
			href="/dishes"
			data-sveltekit-preload-data="hover"
			class="variant-glass-surface flex h-full cursor-pointer flex-col card rounded-xl border border-white/10 bg-white/10 p-8 text-center shadow-md backdrop-blur-sm transition hover:shadow-xl focus:ring-2 focus:ring-white/20 focus:outline-none"
		>
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20"
				>
					<svg
						class="h-8 w-8 text-primary-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
				</div>
				<h2 class="text-on-surface-token mb-2 text-2xl font-bold">Dishes</h2>
				<p class="text-on-surface-token/75 mb-4">
					Browse all {dishes.length} dishes with detailed information about levels, prices, and requirements
				</p>
			</div>
			<span class="mt-auto btn w-full preset-filled btn-lg text-center">View All Dishes</span>
		</a>

		<!-- Ingredients Card -->
		<a
			href="/ingredients"
			data-sveltekit-preload-data="hover"
			class="variant-glass-surface flex h-full cursor-pointer flex-col card rounded-xl border border-white/10 bg-white/10 p-8 text-center shadow-md backdrop-blur-sm transition hover:shadow-xl focus:ring-2 focus:ring-white/20 focus:outline-none"
		>
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-500/20"
				>
					<svg
						class="h-8 w-8 text-secondary-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h2 class="text-on-surface-token mb-2 text-2xl font-bold">Ingredients</h2>
				<p class="text-on-surface-token/75 mb-4">
					Explore all {ingredients.length} ingredients with source locations, types, and gathering information
				</p>
			</div>
			<span class="mt-auto btn w-full preset-filled btn-lg text-center">View All Ingredients</span>
		</a>

		<!-- Parties Card -->
		<a
			href="/parties"
			data-sveltekit-preload-data="hover"
			class="variant-glass-surface flex h-full cursor-pointer flex-col card rounded-xl border border-white/10 bg-white/10 p-8 text-center shadow-md backdrop-blur-sm transition hover:shadow-xl focus:ring-2 focus:ring-white/20 focus:outline-none"
		>
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-500/20"
				>
					<svg
						class="h-8 w-8 text-tertiary-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h2 class="text-on-surface-token mb-2 text-2xl font-bold">Parties</h2>
				<p class="text-on-surface-token/75 mb-4">
					Discover all {parties.length} party events with bonuses and associated dishes
				</p>
			</div>
			<span class="mt-auto btn w-full preset-filled btn-lg text-center">View All Parties</span>
		</a>
	</div>

	<div class="mt-16 text-center">
		<div class="mx-auto max-w-4xl">
			<h2 class="text-on-surface-token mb-6 text-3xl font-bold">About Bancho Box</h2>
			<p class="text-on-surface-token/75 text-lg leading-relaxed">
				Bancho Box is a fan made database for Dave the Diver. It is not affiliated with Dave the
				Diver or its developers or publishers. Assets are sourced from the game and used for
				informational purposes only. All assets are the property of their respective owners. Assets
				are used with the intent of "fair use" to encourage more people to enjoy playing Dave the
				Diver.
			</p>
		</div>
	</div>
</div>
