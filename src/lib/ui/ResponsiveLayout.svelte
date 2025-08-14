<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		left,
		content,
		right,
		title,
		leftTitle = 'Filters & sort',
		containerClass = ''
	}: {
		left?: Snippet;
		content?: Snippet;
		right?: Snippet;
		title?: Snippet;
		leftTitle?: string;
		containerClass?: string;
	} = $props();

	let leftDialogRef: HTMLDialogElement | null = $state(null);
</script>

<div class="px-4 py-6 md:h-[100dvh] md:overflow-hidden {containerClass}">
	<div class="md:flex md:h-full md:gap-6">
		<div class="mb-4 md:hidden">
			<button
				class="btn w-full preset-filled btn-lg"
				onclick={() => (leftDialogRef as HTMLDialogElement)?.showModal()}
			>
				{#if title}
					{@render title!()}
				{:else}
					{leftTitle}
				{/if}
			</button>
		</div>

		<aside class="hidden md:block md:h-full md:w-72 md:shrink-0 md:overflow-auto">
			<div class="top-0 border-r border-white/10 px-4">
				{@render left!()}
			</div>
		</aside>

		<section class="md:h-full md:min-w-0 md:flex-1 md:overflow-y-auto">
			{@render content!()}
		</section>

		{#if right}
			<aside class="hidden md:h-full md:shrink-0 md:overflow-auto lg:block lg:w-64">
				{@render right!()}
			</aside>
		{/if}
	</div>

	<dialog bind:this={leftDialogRef} class="left-drawer modal md:hidden">
		<div class="drawer-panel variant-glass-surface h-dvh w-[80vw] overflow-auto card p-4">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-lg font-semibold">
					{#if title}
						{@render title!()}
					{:else}
						{leftTitle}
					{/if}
				</h3>
				<button
					class="btn preset-tonal btn-sm"
					onclick={() => (leftDialogRef as HTMLDialogElement)?.close()}>Close</button
				>
			</div>
			{@render left!()}
		</div>
		<button
			class="h-dvh w-full bg-black/50"
			aria-label="Close"
			onclick={() => (leftDialogRef as HTMLDialogElement)?.close()}
		></button>
	</dialog>
</div>

<style>
	dialog.left-drawer {
		position: fixed;
		inset: 0;
		margin: 0;
		padding: 0;
		background: transparent;
		/* Hidden by default; shown only on small screens when [open] */
		display: none;
	}
	@media (max-width: 767px) {
		dialog.left-drawer[open] {
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: stretch;
		}
	}
	dialog.left-drawer::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	.drawer-panel {
		margin: 0;
		height: 100dvh;
	}
</style>
