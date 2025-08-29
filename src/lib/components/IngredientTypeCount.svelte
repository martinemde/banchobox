<script lang="ts">
	import IngredientIcon from './IngredientIcon.svelte';

	interface Props {
		type: string;
		count: number;
		size?: number;
	}

	let { type, count, size = 16 }: Props = $props();
</script>

<span class="inline-flex items-center gap-x-1" aria-label={`${type} ×${count}`}>
	<strong class="tabular-nums">{count}</strong>
	<IngredientIcon {type} {size} class="opacity-70" />
</span>
