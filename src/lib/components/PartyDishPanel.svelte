<script lang="ts">
	import ProfitTable from './ProfitTable.svelte';
	import type { PartyDish } from '$lib/types.js';

	let { partyDish } = $props<{ partyDish: PartyDish }>();
</script>

<div class="flex items-start gap-x-4 px-4">
	<div class="w-24 shrink-0"></div>
	<ProfitTable dish={partyDish} />
</div>
