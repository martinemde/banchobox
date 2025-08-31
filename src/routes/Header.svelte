<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { PartyPopper, Soup, ClipboardList, Shrimp, Users } from '@lucide/svelte';
	import BanchoIcon from '$lib/images/bancho.svg';
	import { onMount } from 'svelte';
	import HeaderLink from './HeaderLink.svelte';

	let isHidden = false;
	let lastScrollY = 0;
	let isTicking = false;
	let appBarHeight = 64;
	let appBarEl: HTMLElement;

	function handleRafUpdate() {
		const currentScrollY = window.scrollY || 0;
		const deltaY = currentScrollY - lastScrollY;

		const minDeltaToToggle = 4;
		const topGuard = 32; // never hide near the very top

		if (Math.abs(deltaY) > minDeltaToToggle) {
			if (deltaY > 0 && currentScrollY > topGuard) {
				isHidden = true; // scrolling down
			} else {
				isHidden = false; // scrolling up
			}
			lastScrollY = currentScrollY;
		}

		isTicking = false;
	}

	function onScroll() {
		if (!isTicking) {
			window.requestAnimationFrame(handleRafUpdate);
			isTicking = true;
		}
	}

	onMount(() => {
		lastScrollY = window.scrollY || 0;
		window.addEventListener('scroll', onScroll, { passive: true });
		// Measure and track AppBar height so spacer matches exactly
		const measure = () => {
			if (appBarEl) appBarHeight = appBarEl.offsetHeight || appBarHeight;
		};
		measure();
		const ro = new ResizeObserver(measure);
		if (appBarEl) ro.observe(appBarEl);
		return () => {
			window.removeEventListener('scroll', onScroll);
			ro.disconnect();
		};
	});
</script>

<div class="fixed top-0 right-0 left-0 z-[1000]" style={`--appbar-height: ${appBarHeight}px`}>
	<div
		class="transition-transform duration-200 ease-in-out will-change-transform motion-reduce:!transition-none sm:!transform-none sm:!transition-none sm:!will-change-auto"
		class:[-translate-y-full]={isHidden}
		class:[pointer-events-none]={isHidden}
		bind:this={appBarEl}
	>
		<AppBar>
			{#snippet lead()}
				<h3 class="flex items-center gap-1 font-bold text-primary-500">
					<img src={BanchoIcon} alt="BanchoBox" class="h-6 w-6" />
					<a href="/" class="text-xl sm:text-2xl">BanchoBox</a>
				</h3>
			{/snippet}

			{#snippet trail()}
				<nav class="flex items-center gap-0.5 sm:gap-1">
					<HeaderLink href="/dishes" icon={Soup} label="Dishes" />
					<HeaderLink href="/ingredients" icon={Shrimp} label="Ingredients" />
					<HeaderLink href="/parties" icon={PartyPopper} label="Parties" />
					<HeaderLink href="/staff" icon={Users} label="Staff" />
					<HeaderLink href="/tracking" icon={ClipboardList} label="Tracking" class="ml-auto" />
				</nav>
			{/snippet}
		</AppBar>
	</div>
</div>
<!-- Permanent spacer to keep content position stable regardless of header visibility -->
<div aria-hidden="true" style={`height: ${appBarHeight}px`}></div>
