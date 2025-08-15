<script lang="ts">
  import { page } from '$app/stores';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import { PartyPopper, Soup, ClipboardList, Shrimp } from '@lucide/svelte';
  import { onMount } from 'svelte';

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
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<div class="appbar" style={`--appbar-height: ${appBarHeight}px`}>
<div class="appbar-inner" class:hidden={isHidden} bind:this={appBarEl}>
<AppBar>
  {#snippet lead()}
    <h3 class="text-2xl font-bold text-primary-500">
      <a href="/" class="no-underline">BanchoBox</a>
    </h3>
  {/snippet}

  {#snippet trail()}
    <nav class="flex items-center gap-2">
      <a
        href="/dishes"
        class="nav-link"
        class:active={$page.url.pathname === '/dishes'}
        data-sveltekit-preload-data="hover"
        aria-label="Dishes"
      >
        <Soup size={22} />
        <span class="label hidden sm:inline">Dishes</span>
      </a>
      <a
        href="/ingredients"
        class="nav-link"
        class:active={$page.url.pathname === '/ingredients'}
        data-sveltekit-preload-data="hover"
        aria-label="Ingredients"
      >
        <Shrimp size={22} />
        <span class="label hidden sm:inline">Ingredients</span>
      </a>
      <a
        href="/parties"
        class="nav-link"
        class:active={$page.url.pathname === '/parties'}
        data-sveltekit-preload-data="hover"
        aria-label="Parties"
      >
        <PartyPopper size={22} />
        <span class="label hidden sm:inline">Parties</span>
      </a>
      <a
        href="/tracking"
        class="nav-link ml-auto"
        class:active={$page.url.pathname === '/tracking'}
        data-sveltekit-preload-data="hover"
        aria-label="Tracking"
      >
        <ClipboardList size={22} />
        <span class="label hidden sm:inline">Tracking</span>
      </a>
    </nav>
  {/snippet}
</AppBar>
</div>
</div>
<!-- Permanent spacer to keep content position stable regardless of header visibility -->
<div class="appbar-spacer" aria-hidden="true" style={`height: ${appBarHeight}px`}></div>

<style>
  .appbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .appbar-inner {
    transition: transform 200ms ease-in-out;
    will-change: transform;
  }

  .appbar-inner.hidden {
    transform: translateY(-100%);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .appbar-inner {
      transition: none;
    }
  }

  .appbar-spacer {
    height: var(--appbar-height, 64px);
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-surface-600);
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;
  }

  .nav-link:hover {
    color: var(--color-primary-500);
    background-color: var(--color-surface-100);
  }

  .nav-link.active {
    color: var(--color-primary-500);
    background-color: var(--color-primary-50);
  }
</style>
