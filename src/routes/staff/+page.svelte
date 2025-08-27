<script lang="ts">
	import StaffCard from './StaffCard.svelte';
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
	import { staffStores } from '$lib/stores/staff';
	import { syncToUrl } from '$lib/stores/urlSync';

	const { query, sortKey, sortDir, visible, filters, bundle, baselineFilters } = staffStores;
	syncToUrl('staff', staffStores);

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'wageMax', label: 'Wage Max' },
		{ value: 'hiringFee', label: 'Hiring Fee' },
		{ value: 'cookingStatMax', label: 'Cooking Max' },
		{ value: 'servingStatMax', label: 'Serving Max' },
		{ value: 'procureStatMax', label: 'Procure Max' },
		{ value: 'appealStatMax', label: 'Appeal Max' },
		{ value: 'seasoningsMaxLevel20', label: 'Procure Max (Seasonings L20)' }
	];
</script>

<svelte:head>
	<title>Staff - Bancho Box</title>
	<meta name="description" content="Staff stats and skills for Dave the Diver" />
	<link rel="canonical" href="/staff" />
	<meta property="og:title" content="Staff - Bancho Box" />
	<meta property="og:description" content="Staff stats and skills for Dave the Diver" />
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="staff">
	{#snippet left()}
		<FiltersPanel
			{bundle}
			{filters}
			{baselineFilters}
			bind:query={$query}
			bind:sortKey={$sortKey as string}
			bind:sortDir={$sortDir}
			searchPlaceholder="Search staff by name or skill…"
		/>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-4">
			<ResultsHeader
				{visible}
				entityLabel="Staff"
				bind:sortKey={$sortKey as string}
				bind:sortDir={$sortDir}
				{sortOptions}
			/>
			{#each $visible as staff (staff.id)}
				<StaffCard {staff} />
			{/each}
		</div>
	{/snippet}
</ResponsiveLayout>
