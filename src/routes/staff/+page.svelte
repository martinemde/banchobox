<script lang="ts">
	import StaffCard from './StaffCard.svelte';
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';
	import { staffStores } from '$lib/stores/staff';

	const { visible } = staffStores;

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

<EntityBundlePage
	stores={staffStores}
	urlKey="staff"
	entityLabel="Staff"
	entityLabelPlural="staff"
	searchPlaceholder="Search staff by name or skill…"
	{sortOptions}
	containerClass="staff"
>
	{#snippet content()}
		{#each $visible as staff (staff.id)}
			<StaffCard {staff} />
		{/each}
	{/snippet}
</EntityBundlePage>
