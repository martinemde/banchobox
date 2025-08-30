<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	let {
		left,
		content,
		right,
		title,
		leftTitle = 'Filters & sort',
		containerClass = '',
		leftOpen = $bindable(false)
	}: {
		left?: Snippet;
		content?: Snippet;
		right?: Snippet;
		title?: Snippet;
		leftTitle?: string;
		containerClass?: string;
		leftOpen?: boolean;
	} = $props();
	function closeDrawer() {
		leftOpen = false;
	}
</script>

<div class="flex-1 px-4 py-6 {containerClass}">
	<div class="md:flex md:gap-6">
		<div class="mb-4 md:hidden">
			<Modal
				open={leftOpen}
				onOpenChange={(e) => (leftOpen = e.open)}
				triggerBase="btn w-full preset-filled btn-lg"
				contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[min(88vw,360px)] h-screen"
				positionerJustify="justify-start"
				positionerAlign=""
				positionerPadding=""
				transitionsPositionerIn={{ x: -360, duration: 200 }}
				transitionsPositionerOut={{ x: -360, duration: 200 }}
			>
				{#snippet trigger()}
					{#if title}
						{@render title!()}
					{:else}
						{leftTitle}
					{/if}
				{/snippet}
				{#snippet content()}
					<header class="mt-4 flex items-center justify-between">
						<h3 class="text-lg font-semibold">
							{#if title}
								{@render title!()}
							{:else}
								{leftTitle}
							{/if}
						</h3>
						<button type="button" class="btn preset-tonal btn-sm" onclick={closeDrawer}
							>Close</button
						>
					</header>
					<div class="h-full overflow-auto">
						{@render left!()}
					</div>
				{/snippet}
			</Modal>
		</div>

		<aside class="hidden md:block md:w-72 md:shrink-0">
			<div class="top-0 h-full border-r border-white/10 px-4">
				{@render left!()}
			</div>
		</aside>

		<section class="md:min-w-0">
			{@render content!()}
		</section>

		{#if right}
			<aside class="hidden md:shrink-0 lg:block lg:w-64">
				{@render right!()}
			</aside>
		{/if}
	</div>
</div>
