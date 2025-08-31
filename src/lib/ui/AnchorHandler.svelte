<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	// Offset for fixed header (matches the header height from Header.svelte)
	const HEADER_OFFSET = 80; // A bit more than 64px to provide some breathing room

	function scrollToAnchor(hash: string) {
		if (!hash || hash === '#') return;

		// Remove the # from the hash
		const elementId = hash.slice(1);
		const targetElement = document.getElementById(elementId);

		if (targetElement) {
			const elementPosition = targetElement.offsetTop;
			const offsetPosition = elementPosition - HEADER_OFFSET;

			// Use smooth scrolling
			window.scrollTo({
				top: Math.max(0, offsetPosition),
				behavior: 'smooth'
			});
		}
	}

	// Handle initial page load with hash
	onMount(() => {
		if (typeof window !== 'undefined' && window.location.hash) {
			// Small delay to ensure DOM is fully rendered
			setTimeout(() => {
				scrollToAnchor(window.location.hash);
			}, 100);
		}
	});

	// Handle navigation changes (when clicking anchor links)
	afterNavigate(({ to }) => {
		if (to?.url.hash) {
			// Small delay to ensure page transition is complete
			setTimeout(() => {
				scrollToAnchor(to.url.hash);
			}, 100);
		}
	});
</script>
