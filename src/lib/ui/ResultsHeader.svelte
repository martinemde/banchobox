<script lang="ts">
	import SortControl from '$lib/ui/SortControl.svelte';
	import type { Readable } from 'svelte/store';

	type SortDirection = 'asc' | 'desc';
	type RowLike = { id: number };

	let {
		visible,
		entityLabel = 'Results',
		sortKey = $bindable<string>(''),
		sortDir = $bindable<SortDirection>('asc'),
		sortOptions = [] as Array<{ value: string; label: string }>
	}: {
		visible: Readable<RowLike[]>;
		entityLabel?: string;
		sortKey?: string;
		sortDir?: SortDirection;
		sortOptions?: Array<{ value: string; label: string }>;
	} = $props();

	const count = $derived(($visible ?? []).length);
</script>

<div class="flex items-center justify-between gap-3 py-2">
	<div class="text-sm font-semibold select-none md:text-base">{count} {entityLabel}</div>
	<div class="flex items-center gap-2">
		<SortControl options={sortOptions} bind:column={sortKey} bind:direction={sortDir} />
	</div>
</div>
