<script lang="ts">
	import {
		allCookstaTiers,
		getSelectedCookstaTier,
		selectedChapterId,
		selectedCookstaTierId,
		setSelectedChapter,
		setSelectedCookstaTier,
		allChapters,
		getSelectedChapter,
		allDLCs,
		isDLCEnabled,
		enabledDLCs,
		toggleDLC
	} from '$lib/stores/myBancho.svelte';

	let { expanded = $bindable(false) }: { expanded?: boolean } = $props();

	let enabledDLCNames = $derived(enabledDLCs().map((d) => d.name));
</script>

<div class="rounded-lg border border-white/10 bg-primary-500/10 p-3">
	<div class="text-sm font-semibold">
		<button
			class="relative w-full items-start gap-2 opacity-90 hover:opacity-100"
			type="button"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
			aria-controls="my-bancho-panel"
		>
			<div class="absolute top-0 right-0 flex-shrink-0 font-normal opacity-80 hover:opacity-100">
				{expanded ? 'Done' : 'Edit'}
			</div>
			<div class="justify-start truncate text-left">
				{#if expanded}
					My Bancho
				{:else}
					{getSelectedChapter().name}
					- {getSelectedCookstaTier()?.name ?? ''}
					{#if enabledDLCNames.length > 0}
						<span class="block font-normal">
							{enabledDLCNames.join(', ')}
						</span>
					{/if}
				{/if}
			</div>
		</button>
	</div>

	{#if expanded}
		<div id="my-bancho-panel">
			{#if expanded}
				<label class="label" aria-label="Cooksta">
					<select
						class="ig-select"
						value={selectedCookstaTierId}
						onchange={(e) => setSelectedCookstaTier(Number((e.target as HTMLSelectElement).value))}
					>
						{#each allCookstaTiers as cookstaTier (cookstaTier.id)}
							<option value={cookstaTier.id}>Cooksta {cookstaTier.name}</option>
						{/each}
					</select>
				</label>
				<label class="label" aria-label="Chapter">
					<select
						class="ig-select"
						value={selectedChapterId}
						onchange={(e) => setSelectedChapter(Number((e.target as HTMLSelectElement).value))}
					>
						{#each allChapters as chapter (chapter.id)}
							<option value={chapter.id}>{chapter.name}</option>
						{/each}
					</select>
				</label>
				<fieldset class="mt-2 space-y-1 pl-3 text-sm">
					{#each allDLCs as d (d.id)}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={isDLCEnabled(d.id)}
								onchange={(e) => toggleDLC(d.id, (e.currentTarget as HTMLInputElement).checked)}
							/>
							{d.name}
						</label>
					{/each}
				</fieldset>
			{:else}
				<div class="items-start text-sm">
					<div class="p-1">Cooksta {getSelectedCookstaTier().name ?? ''}</div>
					<div class="p-1">{getSelectedChapter().name ?? ''}</div>
					<ul class="list-inside list-disc space-y-1 p-1">
						{#each allDLCs.filter((d) => isDLCEnabled(d.id)) as d (d.id)}
							<li>{d.name} DLC</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
