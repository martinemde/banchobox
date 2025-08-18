<script lang="ts">
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';
	import { dishesByPartyStore } from '$lib/stores/partyDishes.js';
	import { trackedDishIds } from '$lib/stores/tracking.js';

	// Data from stores
	const dishes = $derived($dishesBundle?.rows ?? []);
	const parties = $derived($partiesBundle?.rows ?? []);
	const dishesByParty = $derived($dishesByPartyStore ?? {} as Record<number, { rows: any[] }>);

	// Interactive demo state
	let selectedPartyId = $state(1); // Jellyfish
	let demoStep = $state(1);

	// Compute demo data
	const selectedParty = $derived(parties.find((p) => p.id === selectedPartyId));
	const partyRows = $derived(dishesByParty[selectedPartyId]?.rows ?? []);
	// Sort by party-adjusted profit per serving if available
	function computePartyProfitPerServing(d: any): number {
		const finalPps = d.finalProfitPerServing ?? d.sort?.finalProfitPerServing ?? 0;
		const bonus = d.partyBonus ?? 1;
		return finalPps * bonus;
	}
	const topPartyDishes = $derived(partyRows.toSorted((a, b) => computePartyProfitPerServing(b) - computePartyProfitPerServing(a)).slice(0, 3));

	// Aggregate ingredient needs for the demo's top dishes
	const demoIngredientList: Array<[string, number]> = $derived((() => {
		const map = new Map<string, number>();
		for (const d of topPartyDishes) {
			for (const ing of d.ingredients ?? []) {
				const key = ing.name as string;
				map.set(key, (map.get(key) ?? 0) + (ing.count ?? 0));
			}
		}
		return [...map.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 6) as Array<[string, number]>;
	})());

	// Tracking preview
	const tracked = $derived(dishes.filter((d) => $trackedDishIds.has(d.id)).slice(0, 3));
</script>

<svelte:head>
	<title>BanchoBox — Master Bancho’s Sushi Bar</title>
	<meta name="description" content="Track ingredients, plan menus, and maximize profit in Dave the Diver with BanchoBox." />
</svelte:head>

<!-- 1) Hero -->
<section class="hero relative overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-16 md:py-24">
		<div class="grid items-center gap-10 md:grid-cols-2">
			<div>
				<h1 class="mb-4 text-4xl font-extrabold leading-tight text-primary-500 md:text-6xl">
					Master Bancho’s Sushi Bar. Plan dives. Max profits.
				</h1>
				<p class="mb-8 text-lg opacity-90 md:text-xl">
					BanchoBox helps you track ingredients, plan menus, and maximize profit in Dave the Diver.
				</p>
				<a href="/tracking" class="btn preset-filled btn-lg">Start Tracking Your Sushi Bar</a>
			</div>
			<div>
				<div class="variant-glass-surface card rounded-xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur">
					<div class="mb-4 flex items-center justify-between">
						<div class="text-sm opacity-80">Tonight’s Outlook</div>
						<div class="text-xs opacity-60">Demo</div>
					</div>
					<div class="grid grid-cols-3 gap-3">
						<div class="stat">
							<div class="label">Cooksta</div>
							<div class="value text-primary-500">A</div>
						</div>
						<div class="stat">
							<div class="label">Menu</div>
							<div class="value">{topPartyDishes.length} dishes</div>
						</div>
						<div class="stat">
							<div class="label">Profit</div>
							<div class="value">
								{Math.round(topPartyDishes.reduce((s, d) => s + computePartyProfitPerServing(d), 0))}G
							</div>
						</div>
					</div>
					<div class="mt-4">
						<div class="mb-2 text-sm font-semibold">{selectedParty?.name ?? 'Party'} Bonus</div>
						<div class="flex items-center gap-2">
							{#each topPartyDishes as d}
								<div class="flex-1">
									<div class="flex justify-between text-xs opacity-80">
										<span>{d.name}</span>
										<span>{Math.round(computePartyProfitPerServing(d))}G/serv</span>
									</div>
									<div class="h-2 rounded bg-surface-300">
										<div class="h-2 rounded bg-primary-500" style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(topPartyDishes[0]) || 1)) * 100)}%`}></div>
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
		<div class="rounded-xl border border-white/10 p-4 variant-glass-surface">
			<div class="title">Cooksta Rank</div>
			<div class="value">A (example)</div>
		</div>
		<div class="rounded-xl border border-white/10 p-4 variant-glass-surface">
			<div class="title">Story Progress</div>
			<div class="value">Chapter 3 (example)</div>
		</div>
		<div class="rounded-xl border border-white/10 p-4 variant-glass-surface">
			<div class="title">Next Party</div>
			<div class="value">{selectedParty?.name ?? '—'} (+{selectedParty?.bonus ?? 0}x)</div>
		</div>
		<div class="rounded-xl border border-white/10 p-4 variant-glass-surface">
			<div class="title">DLCs</div>
			<div class="value">Base + DLC (auto-detected)</div>
		</div>
	</div>
</section>

<!-- 3) Advantage -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">The BanchoBox Advantage</h2>
	<div class="grid gap-6 md:grid-cols-3">
		<div class="rounded-xl border border-white/10 p-5 variant-glass-surface">
			<h3 class="mb-2 text-lg font-semibold">Profitability Analyzer</h3>
			<p class="mb-4 text-sm opacity-80">Which dish actually makes you the most money?</p>
			<div class="space-y-2">
				{#each topPartyDishes as d}
					<div>
						<div class="flex justify-between text-xs opacity-80">
							<span>{d.name}</span>
							<span>{Math.round(computePartyProfitPerServing(d))}G/serv</span>
						</div>
						<div class="h-2 rounded bg-surface-300">
							<div class="h-2 rounded bg-secondary-500" style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(topPartyDishes[0]) || 1)) * 100)}%`}></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="rounded-xl border border-white/10 p-5 variant-glass-surface">
			<h3 class="mb-2 text-lg font-semibold">Dive Planner</h3>
			<p class="mb-4 text-sm opacity-80">Know what ingredients to bring back before you dive.</p>
			<ul class="list-inside list-disc text-sm opacity-90">
				{#each demoIngredientList as [name, count]}
					<li>{count}× {name}</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-xl border border-white/10 p-5 variant-glass-surface">
			<h3 class="mb-2 text-lg font-semibold">Menu Optimizer</h3>
			<p class="mb-4 text-sm opacity-80">Plan tonight’s menu and maximize Cooksta growth.</p>
			<div class="rounded-lg border border-white/10 p-4 text-sm">
				<div class="mb-2 font-semibold">Tonight’s Menu (preview)</div>
				<ul class="space-y-1">
					{#each topPartyDishes as d}
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
			<button class="btn btn-sm" class:preset-filled={demoStep === 1} onclick={() => (demoStep = 1)}>1. Pick party</button>
			<button class="btn btn-sm" class:preset-filled={demoStep === 2} onclick={() => (demoStep = 2)}>2. Compare dishes</button>
			<button class="btn btn-sm" class:preset-filled={demoStep === 3} onclick={() => (demoStep = 3)}>3. Get ingredients</button>
		</div>
		{#if demoStep === 1}
			<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
				{#each parties as p}
					<button
						class="rounded-lg border border-white/10 p-4 text-left variant-glass-surface transition"
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
				{#each topPartyDishes as d}
					<div class="rounded-lg border border-white/10 p-4">
						<div class="mb-1 text-sm font-semibold">{d.name}</div>
						<div class="text-xs opacity-70">Profit: {Math.round(computePartyProfitPerServing(d))}G/serv</div>
						<div class="mt-2 h-2 rounded bg-surface-300">
							<div class="h-2 rounded bg-tertiary-500" style={`width: ${Math.min(100, (computePartyProfitPerServing(d) / (computePartyProfitPerServing(topPartyDishes[0]) || 1)) * 100)}%`}></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div>
				<div class="mb-3 text-sm font-semibold">BanchoBox Ingredient List</div>
				<ul class="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
					{#each demoIngredientList as [name, count]}
						<li class="rounded border border-white/10 p-3 text-sm">
							<div class="flex items-center justify-between">
								<span>{name}</span>
								<span class="opacity-70">{count}×</span>
							</div>
						</li>
					{/each}
				</ul>
				<div class="mt-4 text-xs opacity-70">This is what makes BanchoBox special — instant clarity on what’s worth your dive time.</div>
			</div>
		{/if}
	</div>
</section>

<!-- 5) Tracking Preview -->
<section class="mx-auto max-w-7xl px-4 py-14">
	<h2 class="mb-6 text-2xl font-bold">Tracking Preview</h2>
	{#if tracked.length > 0}
		<div class="grid gap-4 md:grid-cols-3">
			{#each tracked as d}
				<div class="rounded-lg border border-white/10 p-4">
					<div class="mb-1 text-sm font-semibold">{d.name}</div>
					<div class="text-xs opacity-70">Needs: {d.ingredients.map((i) => `${i.count}× ${i.name}`).join(', ')}</div>
					<div class="mt-2 text-xs">Profit potential: {Math.round(d.finalProfitPerServing)}G/serv</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-white/10 p-6 text-sm opacity-90">
			No dishes tracked yet. Here’s a sample:
			<ul class="mt-2 space-y-1">
				{#each topPartyDishes as d}
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
			<p class="quote">“I never waste dives now — BanchoBox tells me exactly what to bring back.”</p>
			<div class="who">— Sato, Chapter 4</div>
		</div>
		<div class="testimonial">
			<p class="quote">“Profit finally clicks. My nights are smoother and way more profitable.”</p>
			<div class="who">— Mei, Cooksta A</div>
		</div>
		<div class="testimonial">
			<p class="quote">“Built by fans, for fans. It just understands Dave the Diver.”</p>
			<div class="who">— Jin, Completionist</div>
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
			<span class="opacity-70 ml-auto">Bancho would approve.</span>
		</div>
	</div>
</section>

<style>
	.hero {
		background:
			linear-gradient(90deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.2) 100%),
			radial-gradient(1200px 600px at 80% 10%, rgba(59,130,246,0.18), transparent),
			radial-gradient(800px 400px at 10% 80%, rgba(236,72,153,0.12), transparent);
	}

	.stat .label { font-size: 0.7rem; opacity: 0.7; }
	.stat .value { font-weight: 700; }

	.title { font-size: 0.8rem; opacity: 0.7; }
	.value { font-weight: 600; }

	.testimonial { border-radius: 0.75rem; border: 1px solid color-mix(in oklch, white 10%, transparent); padding: 1.25rem; background: color-mix(in oklch, white 10%, transparent); }
	.testimonial .quote { font-size: 0.9rem; opacity: 0.9; }
	.testimonial .who { margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6; }

	.link { opacity: 0.9; }
	.link:hover { opacity: 1; }
</style>
