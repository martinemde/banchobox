<script lang="ts">
	import StaffCard from './StaffCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Staff - Bancho Box</title>
	<meta name="description" content="Staff stats and skills for Dave the Diver" />
	<link rel="canonical" href="/staff" />
	<meta property="og:title" content="Staff - Bancho Box" />
	<meta property="og:description" content="Staff stats and skills for Dave the Diver" />
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">{data.staff.length} Staff</h1>

	<div class="space-y-4">
		{#each data.staff as staff (staff.id)}
			<StaffCard {staff} />
		{/each}
	</div>
</div>
