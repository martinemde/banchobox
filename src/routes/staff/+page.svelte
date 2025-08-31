<script lang="ts">
	import StaffCard from './StaffCard.svelte';
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';
	import { staffStores } from '$lib/stores/staff';
	import { hiredStaffIds } from '$lib/stores/hiredStaff.js';
	import HiredStaffSidebar from '$lib/ui/HiredStaffSidebar.svelte';

	const { visible } = staffStores;

	const hired = $derived(
		$visible
			.filter((s) => $hiredStaffIds.has(s.id))
			.map((s) => ({ id: s.id, name: s.name, wage: s.wageMax }))
	);

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'wageMax', label: 'Wage Max' },
		{ value: 'hiringFee', label: 'Hiring Fee' },
		{ value: 'cookingStatMax', label: 'Cooking Max' },
		{ value: 'servingStatMax', label: 'Serving Max' },
		{ value: 'procureStatMax', label: 'Procure Max' },
		{ value: 'appealStatMax', label: 'Appeal Max' },
		{ value: 'maxSeasonings', label: 'Max Seasonings Procured' }
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
	searchPlaceholder="Search by name or skills…"
	{sortOptions}
	containerClass="staff"
>
	{#snippet content()}
		{#each $visible as staff (staff.id)}
			<StaffCard {staff} />
		{/each}
	{/snippet}

	{#snippet rightSidebar()}
		<HiredStaffSidebar {hired} on:toggleHire={(e) => hiredStaffIds.toggle(e.detail)} />
	{/snippet}
</EntityBundlePage>
