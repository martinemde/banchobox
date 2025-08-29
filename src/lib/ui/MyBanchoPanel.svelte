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

	let { enabledDlcIds = $bindable(new SvelteSet<number>()) }: { enabledDlcIds?: Set<number> } =
		$props();

	const cookstaTiers = $derived($cookstaVisible ?? []);
	const chapterRows = $derived($chaptersVisible ?? []);
	const dlcRows = $derived($dlcVisible ?? []);

	let editBancho = $state(false);
	let myBanchoExpanded = $state(true);

	persist(
		'filtersPanel.myBanchoExpanded.v1',
		() => myBanchoExpanded,
		(v) => (myBanchoExpanded = v),
		{ storage: 'local' }
	);
	persist(
		'filtersPanel.enabledDlcIds.v1',
		() => enabledDlcIds,
		(v) => (enabledDlcIds = v),
		{
			storage: 'local',
			serialize: (set) => JSON.stringify(Array.from(set.values())),
			deserialize: (raw) => new SvelteSet<number>(JSON.parse(raw) as number[])
		}
	);

	function toggleDlc(id: number, checked: boolean) {
		const next = new SvelteSet(enabledDlcIds);
		if (checked) next.add(id);
		else next.delete(id);
		enabledDlcIds = next;
	}
</script>

<div class="rounded-lg border border-white/10 bg-primary-500/10 p-3">
	<div class="mb-2 flex items-center justify-between text-sm font-semibold">
		<button
			class="flex items-center gap-2 opacity-90 hover:opacity-100"
			type="button"
			onclick={() => (myBanchoExpanded = !myBanchoExpanded)}
			aria-expanded={myBanchoExpanded}
			aria-controls="my-bancho-panel"
		>
			<span class="caret" data-expanded={myBanchoExpanded}></span>
			<span>
				{myBanchoExpanded
					? 'My Bancho'
					: `${$selectedTier?.name ?? ''} - ${$selectedChapter?.name ?? ''}`}
			</span>
		</button>
		{#if myBanchoExpanded}
			<button
				class="text-xs font-normal opacity-80 hover:opacity-100"
				type="button"
				onclick={() => (editBancho = !editBancho)}
			>
				{editBancho ? 'Done' : 'Edit'}
			</button>
		{/if}
	</div>

	{#if myBanchoExpanded}
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

<style>
	/* caret for collapsible header */
	.caret {
		width: 0;
		height: 0;
		border-top: 5px solid transparent;
		border-bottom: 5px solid transparent;
		border-left: 6px solid currentColor;
		transition: transform 150ms ease;
	}
	.caret[data-expanded='true'] {
		transform: rotate(90deg);
	}
</style>
