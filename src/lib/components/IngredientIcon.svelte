<script lang="ts">
	import {
		CookingPot,
		Carrot,
		Egg,
		Fish,
		FishOff,
		LeafyGreen,
		Loader,
		Shrimp,
		Skull,
		Snowflake,
		Wheat,
		Icon
	} from '@lucide/svelte';
	import { crab } from '@lucide/lab';

	const { type, ...iconProps } = $props();
	const name = type.toLowerCase();
</script>

{#if name === 'crab'}
	<Icon iconNode={crab} {...iconProps} />
{:else if name === 'boss'}
	<Skull {...iconProps} />
{:else if name === 'egg'}
	<Egg {...iconProps} />
{:else if name === 'fish'}
	<Fish {...iconProps} />
{:else if name === 'jango'}
	<Snowflake {...iconProps} />
{:else if name === 'shrimp'}
	<Shrimp {...iconProps} />
{:else if name === 'procure'}
	<CookingPot {...iconProps} />
{:else if name === 'rice'}
	<Wheat {...iconProps} />
{:else if name === 'sea plant'}
	<LeafyGreen {...iconProps} />
{:else if name === 'vegetable'}
	<Carrot {...iconProps} />
{:else if name === 'urchin'}
	<Loader {...iconProps} />
{:else}
	<FishOff {...iconProps} />
{/if}
