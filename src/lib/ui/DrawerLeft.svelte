<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		open = $bindable(false),
		widthClass = 'w-[min(92vw,360px)]',
		title,
		children
	} = $props<{
		open?: boolean;
		widthClass?: string;
		title?: Snippet;
		children?: Snippet;
	}>();

	let dialogEl: HTMLDialogElement | null = null;
	let lastActive: Element | null = null;

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			lastActive = document.activeElement;
			if (!dialogEl.open) dialogEl.showModal();
		} else {
			if (dialogEl.open) dialogEl.close();
		}
	});

	function handleClose() {
		open = false;
		if (lastActive instanceof HTMLElement) {
			try {
				lastActive.focus({ preventScroll: true });
			} catch {}
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed inset-0 m-0 grid grid-cols-[auto_1fr] items-stretch bg-transparent p-0 md:hidden"
	aria-modal="true"
	aria-labelledby="drawer-title"
	onclose={handleClose}
	oncancel={(e) => {
		e.preventDefault();
		handleClose();
	}}
>
	<div
		class={`h-screen border-r border-white/10 bg-surface-50/90 backdrop-blur ${widthClass} overflow-y-auto`}
	>
		<div class="p-4">
			<div class="mb-3 flex items-center justify-between">
				<div id="drawer-title" class="min-w-0">
					{@render title?.()}
				</div>
				<button class="btn preset-tonal btn-sm" aria-label="Close" onclick={() => (open = false)}
					>Close</button
				>
			</div>
			{@render children?.()}
		</div>
	</div>
	<button class="h-screen w-full bg-black/50" aria-label="Close" onclick={() => (open = false)}
	></button>
</dialog>
