<script lang="ts">
	import artisansFlamesImage from '$lib/images/ui/artisans_flames.png';

	let { cost } = $props<{ cost?: number | null }>();

	// Only show the component if cost is a valid positive number
	let shouldShow = $derived(cost != null && cost > 0);
</script>

{#if shouldShow}
	<span
		class="badge inline-flex items-center gap-1 rounded-full preset-tonal-surface py-0.5 text-sm"
	>
		<img
			class="inline-block h-4 w-4 object-contain align-text-bottom"
			src={artisansFlamesImage}
			alt="Artisan's Flames"
			loading="lazy"
			decoding="async"
			width={20}
			height={20}
		/>
		<span class="tabular-nums">{cost}</span>
	</span>
{/if}
