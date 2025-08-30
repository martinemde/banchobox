<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { persist } from '$lib/utils/persisted.svelte';
	import { visible as cookstaVisible, selectedTierId, selectedTier } from '$lib/stores/cooksta';
	import {
		visible as chaptersVisible,
		selectedChapterId,
		selectedChapter
	} from '$lib/stores/chapters';
	import { visible as dlcVisible } from '$lib/stores/dlc';

	let {
		enabledDlcIds = new SvelteSet<number>(),
		expanded = $bindable(true)
	}: { enabledDlcIds?: Set<number>; expanded?: boolean } = $props();

	const cookstaTiers = $derived($cookstaVisible ?? []);
	const chapterRows = $derived($chaptersVisible ?? []);
	const dlcRows = $derived($dlcVisible ?? []);

	let editBancho = $state(false);

	persist(
		'filtersPanel.myBanchoExpanded.v1',
		() => expanded,
		(v) => (expanded = v),
		{
			storage: 'local'
		}
	);
	persist(
		'filtersPanel.enabledDlcIds.v1',
		() => enabledDlcIds,
		(v) => {
			enabledDlcIds.clear();
			for (const id of v) enabledDlcIds.add(id);
		},
		{
			storage: 'local',
			serialize: (set) => JSON.stringify(Array.from(set.values())),
			deserialize: (raw) => new SvelteSet<number>(JSON.parse(raw) as number[])
		}
	);

	function toggleDlc(id: number, checked: boolean) {
		if (checked) enabledDlcIds.add(id);
		else enabledDlcIds.delete(id);
	}
</script>

<div class="rounded-lg border border-white/10 bg-primary-500/10 p-3">
	<div class="mb-2 flex items-center justify-between text-sm font-semibold">
		<button
			class="flex items-center gap-2 opacity-90 hover:opacity-100"
			type="button"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
			aria-controls="my-bancho-panel"
		>
			<span
				class="h-0 w-0 border-t-[5px] border-b-[5px] border-l-[6px] border-t-transparent border-b-transparent border-l-current transition-transform duration-150 ease-linear"
				class:rotate-90={expanded}
			></span>
			<span>
				{expanded ? 'My Bancho' : `${$selectedTier?.name ?? ''} - ${$selectedChapter?.name ?? ''}`}
			</span>
		</button>
		{#if expanded}
			<button
				class="text-xs font-normal opacity-80 hover:opacity-100"
				type="button"
				onclick={() => (editBancho = !editBancho)}
			>
				{editBancho ? 'Done' : 'Edit'}
			</button>
		{/if}
	</div>

	{#if expanded}
		<div id="my-bancho-panel">
			{#if editBancho}
				<label class="label" aria-label="Cooksta">
					<select class="ig-select" bind:value={$selectedTierId}>
						{#each cookstaTiers as t (t.id)}
							<option value={t.id}>Cooksta {t.name}</option>
						{/each}
					</select>
				</label>
				<label class="label" aria-label="Chapter">
					<select class="ig-select" bind:value={$selectedChapterId}>
						{#each chapterRows as c (c.id)}
							<option value={c.id}>{c.name}</option>
						{/each}
					</select>
				</label>
				<fieldset class="mt-2 space-y-1 pl-3 text-sm">
					{#each dlcRows as d (d.id)}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={enabledDlcIds.has(d.id)}
								onchange={(e) => toggleDlc(d.id, (e.currentTarget as HTMLInputElement).checked)}
							/>
							{d.name}
						</label>
					{/each}
				</fieldset>
			{:else}
				<div class="items-start text-sm">
					<div class="p-1">Cooksta {$selectedTier?.name ?? ''}</div>
					<div class="p-1">{$selectedChapter?.name ?? ''}</div>
					{#if Array.from(enabledDlcIds).length === 0}
						<span>&mdash;</span>
					{:else}
						<ul class="list-inside list-disc space-y-1 p-1">
							{#each dlcRows.filter((d) => enabledDlcIds.has(d.id)) as d (d.id)}
								<li>{d.name} DLC</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
