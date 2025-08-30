<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Readable } from 'svelte/store';

	type RowLike = { id: number };

	let {
		visible,
		visibleWithoutBaseline,
		entityLabel = 'items'
	}: {
		visible: Readable<RowLike[]>;
		visibleWithoutBaseline: Readable<RowLike[]>;
		entityLabel?: string;
	} = $props();

	const dispatch = createEventDispatcher<{ 'open-filters': void }>();

	const hiddenCount = $derived(
		Math.max(0, ($visibleWithoutBaseline ?? []).length - ($visible ?? []).length)
	);
	const showIndicator = $derived(hiddenCount > 0);

	function handleActivate() {
		dispatch('open-filters');
	}
</script>

{#if showIndicator}
	<div
		class="cursor-pointer rounded-lg border border-white/10 bg-primary-500/10 px-3 py-2 hover:bg-primary-500/15 focus:ring-2 focus:ring-primary-500/60 focus:outline-none"
		role="button"
		tabindex="0"
		onclick={handleActivate}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleActivate();
			}
		}}
	>
		<div class="text-center text-sm opacity-90">
			{hiddenCount}
			{entityLabel} hidden by My Bancho settings
		</div>
	</div>
{/if}
