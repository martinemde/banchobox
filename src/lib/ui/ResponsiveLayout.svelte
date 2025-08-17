<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';

	let {
		left,
		content,
		right,
		title,
		leftTitle = 'Filters & sort',
		containerClass = '',
		scrollMode = 'container'
	}: {
		left?: Snippet;
		content?: Snippet;
		right?: Snippet;
		title?: Snippet;
		leftTitle?: string;
		containerClass?: string;
		scrollMode?: 'container' | 'page';
	} = $props();

	// Bits UI Dialog manages its own open state via Trigger/Close
</script>

<div class="flex-1 px-4 py-6 {scrollMode === 'container' ? 'md:h-[100dvh]' : ''} {containerClass}">
	<div class="md:flex md:gap-6 {scrollMode === 'container' ? 'md:h-[calc(100dvh-3rem)]' : ''}">
		<Dialog.Root>
			<div class="mb-4 md:hidden">
				<Dialog.Trigger class="btn w-full preset-filled btn-lg">
					{#if title}
						{@render title!()}
					{:else}
						{leftTitle}
					{/if}
				</Dialog.Trigger>
			</div>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 md:hidden" />
				<Dialog.Content class="fixed top-0 left-0 z-50 md:hidden">
					<div
						class="drawer-panel variant-glass-surface h-dvh w-[min(92vw,360px)] overflow-auto card bg-surface-100-900 px-4 pt-20 pb-10"
					>
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								{#if title}
									{@render title!()}
								{:else}
									{leftTitle}
								{/if}
							</h3>
							<Dialog.Close class="btn preset-tonal btn-sm">Close</Dialog.Close>
						</div>
						{@render left!()}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>

		<aside
			class="hidden md:block md:w-72 md:shrink-0 {scrollMode === 'container'
				? 'md:h-full md:overflow-auto'
				: ''}"
		>
			<div class="top-0 h-full border-r border-white/10 px-4">
				{@render left!()}
			</div>
		</aside>

		<section class="md:min-w-0 {scrollMode === 'container' ? 'md:h-full' : ''}">
			{@render content!()}
		</section>

		{#if right}
			<aside
				class="hidden md:shrink-0 lg:block lg:w-64 {scrollMode === 'container'
					? 'md:h-full md:overflow-auto'
					: ''}"
			>
				{@render right!()}
			</aside>
		{/if}
	</div>
</div>

<style>
	.drawer-panel {
		margin: 0;
		height: 100dvh;
	}
</style>
