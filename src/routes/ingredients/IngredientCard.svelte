<script lang="ts">
	import type { Ingredient } from '$lib/types.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import { ChevronsUp, CloudFog, MapPin, Moon, Sun, Soup, Weight } from '@lucide/svelte';
	import coinImage from '$lib/images/ui/coin.png';
	import IngredientIcon from '$lib/components/IngredientIcon.svelte';

	let { ingredient }: { ingredient: Ingredient } = $props();

	// Lazy-load recipes table only when opened
	type RecipesTableComponent = typeof import('./IngredientRecipesTable.svelte').default;
	let LazyRecipesTable: RecipesTableComponent | null = $state(null);
	function ensureRecipesTableLoaded() {
		if (!LazyRecipesTable) {
			import('./IngredientRecipesTable.svelte').then((m) => (LazyRecipesTable = m.default));
		}
	}

	// Controlled accordion value
	let value = $state<string[]>([]);
	function onAccordionValueChange(e: { value?: unknown }) {
		value = (e?.value as string[]) ?? [];
		if (Array.isArray(value) && value.includes('recipes')) ensureRecipesTableLoaded();
	}

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value)) return '—';
		return new Intl.NumberFormat().format(Math.round(value));
	}
</script>

<article
	id="ingredient-{ingredient.id}"
	class="divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover"
>
	<!-- Section 1: Overview (formatted like PartyDish) -->
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block">
				<div class="relative grid place-items-center">
					<PixelIcon image={ingredient.image} alt={ingredient.name} uiScale={1.5} />
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex items-center gap-2">
					<h3 class="m-0 truncate text-lg leading-none font-semibold">{ingredient.name}</h3>
				</div>

				<div class="mt-1 flex flex-row items-center gap-1 *:text-sm">
					<MapPin size={16} class="opacity-70" />
					<span class="truncate">{ingredient.source}</span>
					{#if ingredient.day}
						<span class="inline-flex items-center" title="during the day">
							<Sun size={16} />
							<span class="sr-only">during the day</span>
						</span>
					{/if}
					{#if ingredient.night}
						<span class="inline-flex items-center" title="at night">
							<Moon size={16} />
							<span class="sr-only">at night</span>
						</span>
					{/if}
					{#if ingredient.fog}
						<span class="inline-flex items-center" title="during foggy nights">
							<CloudFog size={16} />
							<span class="sr-only">during foggy nights</span>
						</span>
					{/if}
				</div>

				<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
					<span class="inline-flex items-center gap-1">
						<img
							class="inline-block h-4 w-4 align-text-bottom"
							src={coinImage}
							alt="Sell Price"
							title="Sell Price"
							loading="lazy"
							decoding="async"
							width={20}
							height={20}
						/>
						{ingredient.sell != null ? formatNumber(ingredient.sell) : '—'}
					</span>

					{#if ingredient.kg != null}
						<span class="inline-flex items-center gap-1">
							<Weight size={16} aria-label="weight" />
							{ingredient.kg}kg
						</span>
						<span class="opacity-80">({formatNumber(ingredient.sellPerKg)}/kg)</span>
					{/if}
				</div>

				{#if ingredient.vendors != null && Object.keys(ingredient.vendors).length > 0}
					<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						<span>Buy:</span>
						{#each Object.entries(ingredient.vendors) as [vendor, price] (vendor)}
							<span>{formatNumber(price)} ({vendor})</span>
						{/each}
					</div>
				{/if}
			</div>

			<div class="ml-auto flex items-start gap-2 self-start">
				{#if ingredient.drone}
					<button type="button" class="group relative inline-flex" aria-label="Drone">
						<ChevronsUp size={24} class="opacity-80" />
						<span
							class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
						>
							Drone
						</span>
					</button>
				{/if}
				<button type="button" class="group relative inline-flex" aria-label={ingredient.type}>
					<IngredientIcon type={ingredient.type} size={24} class="opacity-80" />
					<span
						class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
					>
						{ingredient.type}
					</span>
				</button>
			</div>
		</div>
	</section>

	<!-- Section 2: Recipes using this ingredient -->
	{#if ingredient.usedIn.length > 0}
		<section class="border-t border-surface-200-800">
			<Accordion {value} onValueChange={onAccordionValueChange} collapsible>
				<Accordion.Item
					value="recipes"
					controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
				>
					{#snippet lead()}
						<Soup size={16} />
					{/snippet}

					{#snippet control()}
						<span class="text-xs font-semibold tracking-wide uppercase">
							{ingredient.usedIn.length}
							{ingredient.usedIn.length > 1 ? 'Recipes' : 'Recipe'}
						</span>
					{/snippet}

					{#snippet panel()}
						{#if value.includes('recipes') && LazyRecipesTable}
							<LazyRecipesTable {ingredient} {formatNumber} />
						{/if}
					{/snippet}
				</Accordion.Item>
			</Accordion>
		</section>
	{/if}
</article>
