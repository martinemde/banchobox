<script lang="ts">
	import type { Dish, PartyDish as PartyDishEntity, Party } from '$lib/types.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import TrackButton from '$lib/components/TrackButton.svelte';
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import RecipeSummaryIcons from '$lib/components/RecipeSummaryIcons.svelte';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';

	let { dish, partyDish, party } = $props<{
		dish: Dish;
		partyDish: PartyDishEntity; // Calculated values for this dish under the current party
		party: Party;
	}>();

	// Fixed width for thumbnail and track button
	const thumbPx = 96; // 96px (~size-24)

	// Lazy-load recipe panel when user first expands the accordion
	type RecipePanelComponent = typeof import('$lib/components/RecipePanel.svelte').default;
	let LazyRecipePanel: RecipePanelComponent | null = $state(null);
	function ensureRecipePanelLoaded() {
		if (!LazyRecipePanel) {
			import('$lib/components/RecipePanel.svelte').then((m) => (LazyRecipePanel = m.default));
		}
	}

	function onTrackChange(checked: boolean) {
		if (checked) trackedDishIds.track(dish.id);
		else trackedDishIds.untrack(dish.id);
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
	class="divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
>
	<!-- Overview with party calculations -->
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block" style="width: {thumbPx}px">
				<div
					class="relative grid place-items-center"
					style="width: {thumbPx}px; height: {thumbPx}px"
				>
					<span
						class="absolute -top-2 -right-3 z-10 badge rounded-full preset-filled-primary-500 px-1.5 py-0.5"
						>{party?.bonus ?? ''}×</span
					>
					<PixelIcon image={dish.image} alt={dish.name} uiScale={1.5} />
					<div class="absolute -top-2 -left-2 z-10">
						<TrackButton bind:checked={tracked} onchange={onTrackChange} />
					</div>
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-4">
				<header>
					<div class="truncate text-lg leading-none font-semibold">{dish.name}</div>
					{#if dish.unlock}
						<div class="mt-0.5 truncate text-xs opacity-70">{dish.unlock}</div>
					{/if}
				</header>

				<ProfitTable dish={partyDish} />
			</div>
		</div>
	</section>

	<!-- Recipe breakdown (Accordion) -->
	<section>
		<Accordion collapsible defaultValue={[]}>
			<Accordion.Item
				value="recipe"
				controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
			>
				{#snippet control()}
					<button
						type="button"
						class="w-full min-w-0 text-left"
						onclick={ensureRecipePanelLoaded}
						aria-controls="party-recipe-panel"
					>
						<RecipeSummaryIcons {dish} />
					</button>
				{/snippet}

				{#snippet panel()}
					<div id="party-recipe-panel">
						{#if LazyRecipePanel}
							<LazyRecipePanel {dish} />
						{/if}
					</div>
				{/snippet}
			</Accordion.Item>
		</Accordion>
	</section>
</article>
