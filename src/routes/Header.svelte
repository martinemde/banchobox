<script lang="ts">
  import { page } from '$app/stores';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import { CookingPot, PartyPopper, Soup, ClipboardList } from '@lucide/svelte';
  import { trackedIngredientIds } from '$lib/stores/tracking.js';
</script>

<AppBar>
  {#snippet lead()}
    <h3 class="text-xl font-bold text-primary-500 no-underline">Bancho Box</h3>
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
        <span class="relative inline-block">
          <CookingPot size={22} />
          {#if $trackedIngredientIds.size > 0}
            <span class="badge-count" aria-hidden="true">{$trackedIngredientIds.size}</span>
          {/if}
        </span>
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

<style>
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

  .badge-count {
    position: absolute;
    top: -6px;
    right: -10px;
    display: inline-grid;
    place-items: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 9999px;
    background-color: rgb(var(--color-primary-500));
    color: white;
    font-size: 10px;
    line-height: 1;
    font-weight: 700;
  }
</style>
