<script lang="ts">
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import type { PartyDish } from '$lib/types.js';

	let { partyDish } = $props<{ partyDish: PartyDish }>();
</script>

<ProfitTable dish={partyDish} />
