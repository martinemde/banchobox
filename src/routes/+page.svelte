<script lang="ts">
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import artisansFlames from '$lib/images/ui/artisans_flames.png';
	import chickenImage from '$lib/images/ui/chicken.png';
	import tastyImage from '$lib/images/ui/tasty_big.png';
	import type { PartyDish } from '$lib/types.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';
	import { dishesByPartyStore } from '$lib/stores/partyDishes.js';
	import {
		getSelectedCookstaTier,
		allChapters,
		selectedChapterId,
		selectedCookstaTierId,
		setSelectedChapter,
		setSelectedCookstaTier,
		allCookstaTiers,
		allDLCs,
		isDLCEnabled,
		toggleDLC
	} from '$lib/stores/myBancho.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.svelte';
	import { bundle as staffBundle } from '$lib/stores/staff.js';

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
	const normalCustomers = $derived(getSelectedCookstaTier()?.customers ?? 0);
	const nightCustomers = $derived(getSelectedCookstaTier()?.customerNight ?? 0);
	const partyTotalCustomers = $derived(getSelectedCookstaTier()?.customers ?? 0);
	const partyGuests = $derived(getSelectedCookstaTier()?.partyCustomers ?? 0);
	const partyRegulars = $derived(Math.max(0, partyTotalCustomers - partyGuests));
	const operatingCost = $derived(getSelectedCookstaTier()?.operatingCost ?? 0);
	const kitchenStaff = $derived(getSelectedCookstaTier()?.kitchenStaff ?? 0);
	const servingStaff = $derived(getSelectedCookstaTier()?.servingStaff ?? 0);

	const cookstaTierIndex = $derived(
		Math.max(
			0,
			allCookstaTiers.findIndex((cookstaTier) => cookstaTier.id === selectedCookstaTierId)
		)
	);
	const nextCookstaTier = $derived(allCookstaTiers[cookstaTierIndex + 1] ?? null);

	// Tracking preview
	const tracked = $derived(dishes.filter((d) => trackedDishIds.includes(d.id)).slice(0, 3));

	// Staff selection (limited by current Cooksta tier allowances)
	const staffRows = $derived($staffBundle?.rows ?? []);
	let selectedKitchenStaffIds = $state<Array<number | null>>([]);
	let selectedServingStaffIds = $state<Array<number | null>>([]);
	$effect(() => {
		const ks = kitchenStaff;
		const ss = servingStaff;
		// Resize arrays while preserving existing choices
		if (selectedKitchenStaffIds.length !== ks) {
			const next = selectedKitchenStaffIds.slice(0, ks);
			while (next.length < ks) next.push(null);
			selectedKitchenStaffIds = next;
		}
		if (selectedServingStaffIds.length !== ss) {
			const next = selectedServingStaffIds.slice(0, ss);
			while (next.length < ss) next.push(null);
			selectedServingStaffIds = next;
		}
	});
</script>

<svelte:head>
	<title>BanchoBox — Dave the Diver Companion App</title>
	<meta
		name="description"
		content="Track ingredients, plan menus, and maximize profit in Dave the Diver with BanchoBox."
	/>
</svelte:head>

<!-- 1) Hero -->
<section
	class="relative overflow-hidden"
	style="background: linear-gradient(90deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.2) 100%), radial-gradient(1200px 600px at 80% 10%, rgba(59, 130, 246, 0.18), transparent), radial-gradient(800px 400px at 10% 80%, rgba(236, 72, 153, 0.12), transparent);"
>
	<div class="mx-auto max-w-7xl px-4 py-16 md:py-24">
		<div class="grid items-center gap-10 md:grid-cols-2">
			<div class="text-center">
				<h1 class="mb-4 text-4xl leading-tight font-extrabold text-primary-500 md:text-6xl">
					Chef Bancho’s Sushi Bar
				</h1>
				<p class="mb-8 text-lg opacity-90 md:text-xl">
					BanchoBox takes the stress out of planning your Dave the Diver sushi menu with help
					picking dishes and finding ingredients.
				</p>
				<a href="/dishes" class="btn preset-filled btn-lg">Plan Your Menu</a>
			</div>
			<div>
				<div
					class="variant-glass-surface card rounded-xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur"
				>
					<div class="mb-4 flex items-center justify-between">
						<div class="text-sm opacity-80">Tonight’s Menu</div>
						<div class="text-xs opacity-60">Cooksta {getSelectedCookstaTier()?.name ?? ''}</div>
					</div>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<div class="text-[0.7rem] opacity-70">Cooksta</div>
							<div class="font-bold">{getSelectedCookstaTier()?.name ?? ''}</div>
						</div>
						<div>
							<div class="text-[0.7rem] opacity-70">Menu</div>
							<div class="font-bold">{selectedPartyDishes.length} dishes</div>
						</div>
						<div>
							<div class="text-[0.7rem] opacity-70">Profit</div>
							<div class="font-bold">
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
				<div class="label-text text-[0.8rem] opacity-70">Cooksta Rank</div>
				<select
					class="ig-select"
					value={selectedCookstaTierId}
					onchange={(e) => setSelectedCookstaTier(Number(e.currentTarget.value))}
				>
					{#each allCookstaTiers as cookstaTier (cookstaTier.id)}
						<option value={cookstaTier.id}>{cookstaTier.name}</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<label class="label">
				<div class="label-text text-[0.8rem] opacity-70">Story Progress</div>
				<select
					class="ig-select"
					value={selectedChapterId}
					onchange={(e) => setSelectedChapter(Number(e.currentTarget.value))}
				>
					{#each allChapters as c (c.id)}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<label class="label">
				<div class="text-[0.8rem] opacity-70">Next Party</div>
				<select class="ig-select" bind:value={selectedPartyId}>
					{#each parties as p (p.id)}
						<option value={p.id}>{p.name} ({p.bonus}&times; bonus)</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="text-[0.8rem] opacity-70">DLCs</div>
			<fieldset class="mt-2 space-y-1 text-sm">
				{#each allDLCs as d (d.id)}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={isDLCEnabled(d.id)}
							onchange={(e) => toggleDLC(d.id, (e.currentTarget as HTMLInputElement).checked)}
						/>
						{d.name}
					</label>
				{/each}
			</fieldset>
		</div>
	</div>

	<!-- Cooksta breakdown -->
	<div class="mt-6 grid gap-4 md:grid-cols-3">
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
		<div class="variant-glass-surface rounded-xl border border-white/10 p-4">
			<div class="mb-2 text-sm font-semibold">Operating costs</div>
			<ul class="space-y-1 text-sm opacity-90">
				<li>Operating cost: {operatingCost}/night</li>
				<li>Wages: TODO/night</li>
				<li>Staff: {servingStaff} serving, {kitchenStaff} kitchen</li>
			</ul>
		</div>
	</div>

	<!-- Staff selection -->
	<div class="variant-glass-surface mt-6 rounded-xl border border-white/10 p-4">
		<h3 class="mb-4 text-lg font-semibold">Staff</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<div class="mb-2 text-sm font-semibold">Kitchen Staff ({kitchenStaff})</div>
				<div class="space-y-2">
					{#each Array.from({ length: kitchenStaff }, (_, i) => i) as idx (idx)}
						<label class="flex items-center gap-2">
							<span class="text-sm opacity-80">Slot {idx + 1}</span>
							<select class="ig-select" bind:value={selectedKitchenStaffIds[idx]}>
								<option value={null}>—</option>
								{#each staffRows as s (s.id)}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						</label>
					{/each}
				</div>
			</div>
			<div>
				<div class="mb-2 text-sm font-semibold">Serving Staff ({servingStaff})</div>
				<div class="space-y-2">
					{#each Array.from({ length: servingStaff }, (_, i) => i) as idx (idx)}
						<label class="flex items-center gap-2">
							<span class="text-sm opacity-80">Slot {idx + 1}</span>
							<select class="ig-select" bind:value={selectedServingStaffIds[idx]}>
								<option value={null}>—</option>
								{#each staffRows as s (s.id)}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						</label>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Advancement requirements -->
	{#if nextCookstaTier}
		<div class="variant-glass-surface mt-6 rounded-xl border border-white/10 p-4">
			<div class="mb-2 text-sm font-semibold">Advance to {nextCookstaTier.name}</div>
			<div class="grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<div class="opacity-70">Followers</div>
					<div class="font-semibold">≥ {nextCookstaTier.followers}</div>
				</div>
				{#if nextCookstaTier.bestTaste > 0}
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
							<div class="font-semibold">≥ {nextCookstaTier.bestTaste}</div>
						</div>
					</div>
				{/if}
				{#if nextCookstaTier.recipes > 0}
					<div class="flex items-center gap-2">
						<img src={artisansFlames} alt="Artisans Flames" width="30" height="30" class="pixel" />
						<div>
							<div class="leading-tight opacity-70">Research</div>
							<div class="leading-tight font-semibold">{nextCookstaTier.recipes} recipes</div>
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
							<span>{Math.round(computePartyProfitPerServing(d))}/serv</span>
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
							<span class="opacity-70">+{Math.round(computePartyProfitPerServing(d))}/serv</span>
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
		<div class="mb-6 flex flex-col items-center gap-2 text-sm sm:flex-row">
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
							Profit: {Math.round(computePartyProfitPerServing(d))}/serv
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
						Profit potential: {Math.round(d.finalProfitPerServing)}/serv
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
						<span class="opacity-70">{Math.round(computePartyProfitPerServing(d))}/serv</span>
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
		<div class="rounded-xl border border-[rgb(255_255_255_/_10%)] bg-[rgb(255_255_255_/_10%)] p-5">
			<p class="text-[0.9rem] opacity-90">
				"I never feel lost during dives now — I'm not a completionist, so I don't want to spend
				hours every night. BanchoBox tells me exactly what to bring back."
			</p>
			<div class="mt-2 text-xs opacity-60">— Sato, Chapter 4</div>
		</div>
		<div class="rounded-xl border border-[rgb(255_255_255_/_10%)] bg-[rgb(255_255_255_/_10%)] p-5">
			<p class="text-[0.9rem] opacity-90">
				"I used to auto-supply a full menu, I was stuck at Gold. Now the restaurant is actually
				fun."
			</p>
			<div class="mt-2 text-xs opacity-60">— Mei, Cooksta Gold</div>
		</div>
		<div class="rounded-xl border border-[rgb(255_255_255_/_10%)] bg-[rgb(255_255_255_/_10%)] p-5">
			<p class="text-[0.9rem] opacity-90">
				"Built by fans, for fans. A better way to play Dave the Diver."
			</p>
			<div class="mt-2 text-xs opacity-60">— Martin, Completionist</div>
		</div>
	</div>
</section>

<!-- 7) Footer links -->
<section class="mx-auto max-w-7xl px-4 pb-20">
	<div class="rounded-lg border border-white/10 p-6">
		<div class="flex flex-wrap items-center gap-4 text-sm">
			<a class="opacity-90 hover:opacity-100" href="/about">About</a>
			<a class="opacity-90 hover:opacity-100" href="/tracking">Tracking</a>
			<a class="opacity-90 hover:opacity-100" href="/dishes">Dishes</a>
			<a class="opacity-90 hover:opacity-100" href="/ingredients">Ingredients</a>
			<a class="opacity-90 hover:opacity-100" href="/parties">Parties</a>
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
