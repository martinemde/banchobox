<script lang="ts">
	import type { Dish, Id, PartyDish } from '$lib/types.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import TrackButton from '$lib/components/TrackButton.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import { PartyPopper, Soup } from '@lucide/svelte';
	import { partyDishByIdStore } from '$lib/stores/partyDishes.js';
	import RecipeSummaryIcons from '$lib/components/RecipeSummaryIcons.svelte';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import ArtisansFlamesCost from '$lib/components/ArtisansFlamesCost.svelte';
	// import tasteIcon from '$lib/images/ui/sort_taste.png';
	// import levelIcon from '$lib/images/ui/sort_level.png';
	// import servingsIcon from '$lib/images/ui/sort_servings.png';
	import servingsImage from '$lib/images/ui/servings.png';
	import coinImage from '$lib/images/ui/coin.png';

	let { dish } = $props<{ dish: Dish }>();

	// Lazy-load recipe panel when user first expands the accordion
	type RecipePanelComponent = typeof import('$lib/components/RecipePanel.svelte').default;
	let LazyRecipePanel: RecipePanelComponent | null = $state(null);
	function ensureRecipePanelLoaded() {
		if (!LazyRecipePanel) {
			import('$lib/components/RecipePanel.svelte').then((m) => (LazyRecipePanel = m.default));
		}
	}

	type PartyDishPanelComponent = typeof import('./PartyDishPanel.svelte').default;
	let LazyPartyDishPanel: PartyDishPanelComponent | null = $state(null);
	function ensurePartyDishPanelLoaded() {
		if (!LazyPartyDishPanel) {
			import('./PartyDishPanel.svelte').then((m) => (LazyPartyDishPanel = m.default));
		}
	}

	function onTrackChange(checked: boolean) {
		if (checked) trackedDishIds.track(dish.id);
		else trackedDishIds.untrack(dish.id);
	}
	// Minimize per-card memory by keeping only metadata for controls
	type PartyDishMeta = { id: Id; partyId: Id; partyName: string; partyBonus: number };
	let partyDishesMeta = $derived(
		(dish.partyDishIds ?? [])
			.map((id: Id) => {
				const pd = $partyDishByIdStore?.[id] as PartyDish | undefined;
				return pd
					? { id: pd.id, partyId: pd.partyId, partyName: pd.partyName, partyBonus: pd.partyBonus }
					: null;
			})
			.filter((x: PartyDishMeta | null): x is PartyDishMeta => x !== null)
	);

	// Controlled accordion value; use bind and react to changes
	let value = $state<string[]>([]);
	function onAccordionValueChange(e: { value: string[] }) {
		const next = e.value;
		value = next;
		if (next?.includes('recipe')) ensureRecipePanelLoaded();
		if (next?.some((v) => typeof v === 'string' && v.startsWith('party-')))
			ensurePartyDishPanelLoaded();
	}

	let servings = $derived(dish.finalServings);
	let profitPerServing = $derived(dish.finalProfitPerServing);
	let profitTotal = $derived(dish.finalProfit);

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value)) return '—';
		return new Intl.NumberFormat().format(Math.round(value));
	}

	// Two-way tracked binding via store
	let tracked = $state(false);
	$effect(() => {
		const unsub = trackedDishIds.subscribe((set) => {
			const v = set.has(dish.id);
			if (tracked !== v) tracked = v;
		});
		return () => unsub();
	});
	$effect(() => {
		if (tracked) trackedDishIds.track(dish.id);
		else trackedDishIds.untrack(dish.id);
	});
</script>

<article
	id="dish-{dish.id}"
	class="min-w-40 divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
>
	<!-- Section 1: Overview -->
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block">
				<div class="relative grid place-items-center">
					<PixelIcon image={dish.image} alt={dish.name} uiScale={1.5} />
					<div class="absolute -top-2 -left-2 z-10">
						<TrackButton bind:checked={tracked} onchange={onTrackChange} />
					</div>
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-4">
				<header>
					<div class="truncate text-lg leading-none font-semibold">{dish.name}</div>
					<div class="text-md mt-1 flex items-center gap-2">
						{#if dish.staff}
							<span class="truncate opacity-70">
								{#if dish.staff === 'Any staff' || !dish.staffId}
									{dish.staff}
								{:else}
									<a
										href="/staff#staff-{dish.staffId}"
										class="text-primary-800-200 transition-colors hover:text-primary-600-400 hover:underline"
									>
										{dish.staff}
									</a>
								{/if}
								(Level {dish.staffLevel})
							</span>
						{:else if dish.unlock}
							<span class="truncate opacity-70">{dish.unlock}</span>
						{/if}
						<ArtisansFlamesCost cost={dish.artisansFlames} />
					</div>
				</header>

				<!--
				<div class="flex items-center gap-x-3 text-center">
					<span class="opacity-70">Max:</span>

					<span>
						<img
							class="inline-block h-4 w-4 object-contain align-text-bottom"
							src={levelIcon}
							alt="Max Level"
							loading="lazy"
							decoding="async"
							width={iconPx}
							height={iconPx}
						/>
						<span>{dish.maxLevel}</span>
					</span>

					<span>
						<img
							class="inline-block h-4 w-4 object-contain align-text-bottom"
							src={tasteIcon}
							alt="Taste"
							loading="lazy"
							decoding="async"
							width={iconPx}
							height={iconPx}
						/>
						<span>{dish.finalTaste}</span>
					</span>

					<span>
						<img
							class="inline-block h-4 w-4 object-contain align-text-bottom"
							src={servingsIcon}
							alt="Servings"
							loading="lazy"
							decoding="async"
							width={iconPx}
							height={iconPx}
						/>
						<span>{dish.finalServings}</span>
					</span>
				</div>
				-->
			</div>
		</div>
	</section>

	<!-- Section 2 & 3: Collapsible Recipe and Parties -->
	<section>
		<Accordion {value} onValueChange={onAccordionValueChange} multiple collapsible>
			<Accordion.Item
				value="profit"
				controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
			>
				{#snippet lead()}
					<img class="inline-block h-4 w-4 align-text-bottom" src={coinImage} alt="Price" />
				{/snippet}

				{#snippet control()}
					<div class="items-baseline gap-x-2 font-semibold">
						<div class="flex items-center gap-x-3 text-right tabular-nums">
							<span>
								{formatNumber(profitPerServing)}
							</span>
							<span class="whitespace-nowrap opacity-70">×</span>
							<span class="whitespace-nowrap"
								>{servings}
								<img
									class="inline-block h-4 w-4 align-text-bottom"
									src={servingsImage}
									alt="Servings"
									loading="lazy"
									decoding="async"
									width={20}
									height={20}
								/>
							</span>
							<span class="whitespace-nowrap"> = </span>
							<span class="whitespace-nowrap">{formatNumber(profitTotal)}</span>
						</div>
					</div>
				{/snippet}

				{#snippet panel()}
					<ProfitTable {dish} />
				{/snippet}
			</Accordion.Item>

			<Accordion.Item
				value="recipe"
				controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
			>
				{#snippet lead()}
					<Soup size={16} />
				{/snippet}

				{#snippet control()}
					<RecipeSummaryIcons {dish} />
				{/snippet}

				{#snippet panel()}
					<div id="recipe-panel">
						{#if value.includes('recipe') && LazyRecipePanel}
							<LazyRecipePanel {dish} />
						{/if}
					</div>
				{/snippet}
			</Accordion.Item>

			{#each partyDishesMeta as meta (meta.id)}
				<Accordion.Item
					value={`party-${meta.partyId}`}
					controlHover="hover:preset-filled-primary-900-100 hover:text-primary-300-700"
					classes="border-t border-surface-200-800"
				>
					{#snippet lead()}
						<PartyPopper size={16} />
					{/snippet}
					{#snippet control()}
						<span class="font-semibold">{meta.partyBonus}×</span>
						<span class="text-sm">{meta.partyName} Party</span>
					{/snippet}

					{#snippet panel()}
						{#if value.includes(`party-${meta.partyId}`)}
							{@const partyDish = $partyDishByIdStore?.[meta.id]}
							{#if partyDish}
								{#if LazyPartyDishPanel}
									<LazyPartyDishPanel {partyDish} />
								{/if}
							{/if}
						{/if}
					{/snippet}
				</Accordion.Item>
			{/each}
		</Accordion>
	</section>
</article>
