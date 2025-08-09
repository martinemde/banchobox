<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createEventDispatcher } from 'svelte';

	export let rootMargin: string = '200px';
	export let once: boolean = false;

	const dispatch = createEventDispatcher<{ visible: void }>();
	let element: HTMLDivElement | null = null;
	let observer: IntersectionObserver | null = null;
	let hasFired = false;

	onMount(() => {
		if (!browser || !element) return;
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						if (once && hasFired) return;
						hasFired = true;
						dispatch('visible');
					}
				}
			},
			{ root: null, rootMargin, threshold: 0 }
		);
		observer.observe(element);
		return () => {
			observer?.disconnect();
			observer = null;
		};
	});
</script>

<div bind:this={element} class="load-sentinel" aria-hidden="true"></div>

<style>
	.load-sentinel {
		height: 1px;
		width: 100%;
	}
</style>
