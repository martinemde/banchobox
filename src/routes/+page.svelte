<script lang="ts">
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';
	import { dishesByPartyStore } from '$lib/stores/partyDishes.js';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { selectedTier, selectedTierId, visible as cookstaVisible } from '$lib/stores/cooksta.js';
	import type { PartyDish } from '$lib/types.js';
	import artisansFlames from '$lib/images/ui/artisans_flames.png';
	import tastyImage from '$lib/images/ui/tasty_big.png';
	import chickenImage from '$lib/images/ui/chicken.png';

	// Data from stores
	const dishes = $derived($dishesBundle?.rows ?? []);
	const parties = $derived($partiesBundle?.rows ?? []);

	interface PartyDishRowShape {
		id: number;
		name: string;
		image: string;
		finalProfitPerServing?: number;
		partyBonus?: number;
		ingredients?: Array<{ name: string; count: number }>;
		sort?: { finalProfitPerServing?: number };
	}
	const dishesByParty = $derived(
		$dishesByPartyStore ?? ({} as Record<number, { rows: PartyDishRowShape[] }>)
	);

	// Interactive demo state
	let selectedPartyId = $state(1); // Jellyfish
	let demoStep = $state(1);

	// Compute demo data
	const selectedParty = $derived(parties.find((p) => p.id === selectedPartyId));
	const partyRows = $derived(dishesByParty[selectedPartyId]?.rows ?? []);
	// Sort by party-adjusted profit per serving if available
	function computePartyProfitPerServing(d: PartyDishRowShape | PartyDish): number {
		const sortVal = d?.sort?.finalProfitPerServing;
		const finalPps =
			d?.finalProfitPerServing ?? (typeof sortVal === 'string' ? Number(sortVal) : (sortVal ?? 0));
		const bonus = d?.partyBonus ?? 1;
		return finalPps * bonus;
	}
	const selectedPartyDishes = $derived(
		partyRows
			.toSorted((a, b) => computePartyProfitPerServing(a) - computePartyProfitPerServing(b))
			.slice(0, 3)
	);

	// Aggregate ingredient needs for the demo's top dishes
	const demoIngredientList: Array<[string, number]> = $derived(
		(() => {
			const map = new SvelteMap<string, number>();
			for (const d of selectedPartyDishes) {
				for (const ing of d.ingredients ?? []) {
					const key = ing.name as string;
					map.set(key, (map.get(key) ?? 0) + (ing.count ?? 0));
				}
			}
			return [...map.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 6) as Array<
				[string, number]
			>;
		})()
	);

	// Cooksta derived stats and next tier
	const cookstaTiers = $derived($cookstaVisible ?? []);
	const cookstaCurrent = $derived($selectedTier);
	const cookstaCurrentId = $derived($selectedTier?.id ?? null);
	const normalCustomers = $derived(cookstaCurrent?.customers ?? 0);
	const nightCustomers = $derived(cookstaCurrent?.customerNight ?? 0);
	const partyTotalCustomers = $derived(cookstaCurrent?.customers ?? 0);
	const partyGuests = $derived(cookstaCurrent?.partyCustomers ?? 0);
	const partyRegulars = $derived(Math.max(0, partyTotalCustomers - partyGuests));

	const tierIndex = $derived(
		Math.max(
			0,
			cookstaTiers.findIndex((t) => t.id === cookstaCurrentId)
		)
	);
	const nextTier = $derived(cookstaTiers[tierIndex + 1] ?? null);

	// Tracking preview
	const tracked = $derived(dishes.filter((d) => $trackedDishIds.has(d.id)).slice(0, 3));
</script>

<svelte:head>
	<title>BanchoBox — Master Bancho’s Sushi Bar</title>
	<meta
		name="description"
		content="Track ingredients, plan menus, and maximize profit in Dave the Diver with BanchoBox."
	/>
</svelte:head>

<!-- 1) Hero -->
<section class="hero relative overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-16 md:py-24">
		<div class="grid items-center gap-10 md:grid-cols-2">
			<div>
				<h1 class="mb-4 text-4xl leading-tight font-extrabold text-primary-500 md:text-6xl">
					Chef Bancho’s Sushi Bar. Plan Dives. Perfect Dishes.
				</h1>
				<p class="mb-8 text-lg opacity-90 md:text-xl">
					BanchoBox, a Dave the Diver companion app, takes the stress out of planning your sushi
					menu.<br />
					Get dish and ingredient recommendations, track your progress, and find which dishes turn the
					best profit for your restaurant.
				</p>
				<a href="/tracking" class="btn preset-filled btn-lg">Start Tracking Your Sushi Bar</a>
			</div>
			<div>
				<div
					class="variant-glass-surface card rounded-xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur"
				>
					<div class="mb-4 flex items-center justify-between">
						<div class="text-sm opacity-80">Tonight’s Menu</div>
						<div class="text-xs opacity-60">Demo</div>
					</div>
					<div class="grid grid-cols-3 gap-3">
						<div class="stat">
							<div class="label">Cooksta</div>
							<div class="value text-warning-500">Gold</div>
						</div>
						<div class="stat">
							<div class="label">Menu</div>
							<div class="value">{selectedPartyDishes.length} dishes</div>
						</div>
						<div class="stat">
							<div class="label">Profit</div>
							<div class="value">
								{Math.round(
									selectedPartyDishes.reduce((s, d) => s + computePartyProfitPerServing(d), 0)
								)} / Serving
							</div>
						</div>
					</div>
					<div class="mt-4">
						<div class="mb-2 text-sm font-semibold">{selectedParty?.name ?? 'Party'} Bonus</div>
						<div class="flex items-start gap-2">
							{#each selectedPartyDishes as d (d.id)}
								<div class="flex-1">
									<div class="flex justify-between text-xs opacity-80">
										<PixelIcon image={d.image} alt={d.name} uiScale={1.5} />
									</div>
									<div class="flex justify-between text-xs opacity-80">
										<span>{d.name}</span>
										<span>{Math.round(computePartyProfitPerServing(d))}G/serv</span>
									</div>
									<div class="h-2 rounded bg-surface-300">
										<div
											class="h-2 rounded bg-primary-500"
											style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(selectedPartyDishes[0]) || 1)) * 100)}%`}
										></div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- 2) What BanchoBox knows -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">What BanchoBox knows about your game</h2>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<label class="label">
				<div class="title label-text">Cooksta Rank</div>
				<select class="ig-select" bind:value={$selectedTierId}>
					{#each cookstaTiers as t (t.id)}
						<option value={t.id}>{t.rank}</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="title">Story Progress</div>
			<div class="value">Chapter 3</div>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<label class="label">
				<div class="title">Next Party</div>
				<select class="ig-select" bind:value={selectedPartyId}>
					{#each parties as p (p.id)}
						<option value={p.id}>{p.name} ({p.bonus}&times; bonus)</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="title">DLCs</div>
			<div class="value">Pick your DLCs</div>
		</div>
	</div>

	<!-- Cooksta breakdown -->
	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="mb-2 text-sm font-semibold">Customers</div>
			<ul class="space-y-1 text-sm opacity-90">
				<li>Normal night: {normalCustomers}</li>
				<li>Night dive: {nightCustomers}</li>
			</ul>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="mb-2 text-sm font-semibold">Party night</div>
			<ul class="space-y-1 text-sm opacity-90">
				<li>Total customers: {partyTotalCustomers}</li>
				<li>Regulars: {partyRegulars}</li>
				<li>Party guests: {partyGuests}</li>
			</ul>
		</div>
	</div>

	<!-- Advancement requirements -->
	{#if nextTier}
		<div class="variant-glass-surface mt-6 rounded-xl border border-white/10 p-4">
			<div class="mb-2 text-sm font-semibold">Advance to {nextTier.rank}</div>
			<div class="grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<div class="opacity-70">Followers</div>
					<div class="font-semibold">≥ {nextTier.followers}</div>
				</div>
				{#if nextTier.bestTaste > 0}
					<div class="flex items-center gap-2">
						<img
							src={tastyImage}
							alt="Taste Icon"
							width="30"
							height="30"
							class="pixel"
							aria-hidden="true"
						/>
						<div>
							<div class="opacity-70">Best taste</div>
							<div class="font-semibold">≥ {nextTier.bestTaste}</div>
						</div>
					</div>
				{/if}
				{#if nextTier.recipes > 0}
					<div class="flex items-center gap-2">
						<img src={artisansFlames} alt="Artisans Flames" width="30" height="30" class="pixel" />
						<div>
							<div class="leading-tight opacity-70">Research</div>
							<div class="leading-tight font-semibold">{nextTier.recipes} recipes</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</section>

<!-- 3) Advantage -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">The BanchoBox Advantage</h2>
	<div class="grid gap-6 md:grid-cols-3">
		<div class="variant-glass-surface rounded-xl border border-white/10 p-5">
			<h3 class="mb-2 text-lg font-semibold">Profitability Analyzer</h3>
			<p class="mb-4 text-sm opacity-80">Which dish actually makes you the most money?</p>
			<div class="space-y-2">
				{#each selectedPartyDishes as d (d.id)}
					<div>
						<div class="flex justify-between text-xs opacity-80">
							<span>{d.name}</span>
							<span>{Math.round(computePartyProfitPerServing(d))}G/serv</span>
						</div>
						<div class="h-2 rounded bg-surface-300">
							<div
								class="h-2 rounded bg-secondary-500"
								style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(selectedPartyDishes[0]) || 1)) * 100)}%`}
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-5">
			<h3 class="mb-2 text-lg font-semibold">Dive Planner</h3>
			<p class="mb-4 text-sm opacity-80">Know what ingredients to bring back before you dive.</p>
			<ul class="list-inside list-disc text-sm opacity-90">
				{#each demoIngredientList as [name, count] (name)}
					<li>{count}× {name}</li>
				{/each}
			</ul>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-5">
			<h3 class="mb-2 text-lg font-semibold">Menu Optimizer</h3>
			<p class="mb-4 text-sm opacity-80">Plan tonight’s menu and maximize Cooksta growth.</p>
			<div class="rounded-lg border border-white/10 p-4 text-sm">
				<div class="mb-2 font-semibold">Tonight’s Menu (preview)</div>
				<ul class="space-y-1">
					{#each selectedPartyDishes as d (d.id)}
						<li class="flex items-center justify-between">
							<span>{d.name}</span>
							<span class="opacity-70">+{Math.round(computePartyProfitPerServing(d))}G/serv</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- 4) Interactive Demo -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">Try it in 3 quick steps</h2>
	<div class="variant-glass-surface card rounded-xl border border-white/10 bg-white/10 p-6">
		<div class="mb-6 flex items-center gap-2 text-sm">
			<button class="btn btn-sm" class:preset-filled={demoStep === 1} onclick={() => (demoStep = 1)}
				>1. Pick party</button
			>
			<button class="btn btn-sm" class:preset-filled={demoStep === 2} onclick={() => (demoStep = 2)}
				>2. Compare dishes</button
			>
			<button class="btn btn-sm" class:preset-filled={demoStep === 3} onclick={() => (demoStep = 3)}
				>3. Get ingredients</button
			>
		</div>
		{#if demoStep === 1}
			<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
				{#each parties as p (p.id)}
					<button
						class="variant-glass-surface rounded-lg border border-white/10 p-4 text-left transition"
						class:ring-2={selectedPartyId === p.id}
						class:ring-primary-500={selectedPartyId === p.id}
						onclick={() => (selectedPartyId = p.id)}
					>
						<div class="text-sm font-semibold">{p.name}</div>
						<div class="text-xs opacity-70">+{p.bonus}x bonus</div>
					</button>
				{/each}
			</div>
		{:else if demoStep === 2}
			<div class="grid gap-4 md:grid-cols-3">
				{#each selectedPartyDishes as d (d.id)}
					<div class="rounded-lg border border-white/10 p-4">
						<div class="mb-1 text-sm font-semibold">{d.name}</div>
						<div class="text-xs opacity-70">
							Profit: {Math.round(computePartyProfitPerServing(d))}G/serv
						</div>
						<div class="mt-2 h-2 rounded bg-surface-300">
							<div
								class="h-2 rounded bg-tertiary-500"
								style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(selectedPartyDishes[0]) || 1)) * 100)}%`}
							></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div>
				<div class="mb-3 text-sm font-semibold">BanchoBox Ingredient List</div>
				<ul class="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
					{#each demoIngredientList as [name, count] (name)}
						<li class="rounded border border-white/10 p-3 text-sm">
							<div class="flex items-center justify-between">
								<span>{name}</span>
								<span class="opacity-70">{count}×</span>
							</div>
						</li>
					{/each}
				</ul>
				<div class="mt-4 text-xs opacity-70">
					This is what makes BanchoBox special — instant clarity on what’s worth your dive time.
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- 5) Tracking Preview -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">Tracking Preview</h2>
	{#if tracked.length > 0}
		<div class="grid gap-4 md:grid-cols-3">
			{#each tracked as d (d.id)}
				<div class="rounded-lg border border-white/10 p-4">
					<div class="mb-1 text-sm font-semibold">{d.name}</div>
					<div class="text-xs opacity-70">
						Needs: {d.ingredients.map((i) => `${i.count}× ${i.name}`).join(', ')}
					</div>
					<div class="mt-2 text-xs">
						Profit potential: {Math.round(d.finalProfitPerServing)}G/serv
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-white/10 p-6 text-sm opacity-90">
			No dishes tracked yet. Here’s a sample:
			<ul class="mt-2 space-y-1">
				{#each selectedPartyDishes as d (d.id)}
					<li class="flex items-center justify-between">
						<span>{d.name}</span>
						<span class="opacity-70">{Math.round(computePartyProfitPerServing(d))}G/serv</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="mt-4">
		<a href="/tracking" class="btn preset-filled btn-lg">See your full tracking page →</a>
	</div>
</section>

<!-- 6) Community & Trust -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">Loved by Divers</h2>
	<div class="grid gap-4 md:grid-cols-3">
		<div class="testimonial">
			<p class="quote">
				“I never feel lost during dives now — I'm not a completionist, so I don't want to spend
				hours every night. BanchoBox tells me exactly what to bring back.”
			</p>
			<div class="who">— Sato, Chapter 4</div>
		</div>
		<div class="testimonial">
			<p class="quote">
				“I used to auto-supply a full menu, I was stuck at Gold. Now the restaurant is actually
				fun.”
			</p>
			<div class="who">— Mei, Cooksta Gold</div>
		</div>
		<div class="testimonial">
			<p class="quote">“Built by fans, for fans. A better way to play Dave the Diver.”</p>
			<div class="who">— Martin, Completionist</div>
		</div>
	</div>
</section>

<!-- 7) Footer links -->
<section class="mx-auto max-w-7xl px-4 pb-20">
	<div class="rounded-lg border border-white/10 p-6">
		<div class="flex flex-wrap items-center gap-4 text-sm">
			<a class="link" href="/about">About</a>
			<a class="link" href="/tracking">Tracking</a>
			<a class="link" href="/dishes">Dishes</a>
			<a class="link" href="/ingredients">Ingredients</a>
			<a class="link" href="/parties">Parties</a>
			<span class="ml-auto flex items-center gap-2 opacity-70">
				<span>Help Dave help Bancho</span>
				<img
					src={chickenImage}
					alt="Chicken Icon"
					width="40"
					height="40"
					class="pixel"
					aria-hidden="true"
				/>
			</span>
		</div>
	</div>
</section>

<style>
	.hero {
		background:
			linear-gradient(90deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.2) 100%),
			radial-gradient(1200px 600px at 80% 10%, rgba(59, 130, 246, 0.18), transparent),
			radial-gradient(800px 400px at 10% 80%, rgba(236, 72, 153, 0.12), transparent);
	}

	.stat .label {
		font-size: 0.7rem;
		opacity: 0.7;
	}
	.stat .value {
		font-weight: 700;
	}

	.title {
		font-size: 0.8rem;
		opacity: 0.7;
	}
	.value {
		font-weight: 600;
	}

	.testimonial {
		border-radius: 0.75rem;
		border: 1px solid color-mix(in oklch, white 10%, transparent);
		padding: 1.25rem;
		background: color-mix(in oklch, white 10%, transparent);
	}
	.testimonial .quote {
		font-size: 0.9rem;
		opacity: 0.9;
	}
	.testimonial .who {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		opacity: 0.6;
	}

	.link {
		opacity: 0.9;
	}
	.link:hover {
		opacity: 1;
	}
</style>
