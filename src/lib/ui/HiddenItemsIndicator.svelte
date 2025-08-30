<script lang="ts">
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

	const hiddenCount = $derived(
		Math.max(0, ($visibleWithoutBaseline ?? []).length - ($visible ?? []).length)
	);
	const showIndicator = $derived(hiddenCount > 0);
</script>

{#if showIndicator}
	<div class="rounded-lg border border-white/10 bg-primary-500/10 px-3 py-2">
		<div class="text-center text-sm opacity-90">
			{hiddenCount}
			{entityLabel} hidden by My Bancho settings
		</div>
	</div>
{/if}
