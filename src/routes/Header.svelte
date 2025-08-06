<script lang="ts">
  import { page } from '$app/stores';
</script>

<header class="bg-white shadow-sm border-b">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <div class="text-xl font-bold text-blue-600">Dave Menu</div>
      </div>

      <nav class="flex space-x-8">
        <a
          href="/"
          class="nav-link"
          class:active={$page.url.pathname === '/'}
          data-sveltekit-preload-data="hover"
        >
          Home
        </a>
        <a
          href="/dishes"
          class="nav-link"
          class:active={$page.url.pathname === '/dishes'}
          data-sveltekit-preload-data="hover"
        >
          Dishes
        </a>
        <a
          href="/ingredients"
          class="nav-link"
          class:active={$page.url.pathname === '/ingredients'}
          data-sveltekit-preload-data="hover"
        >
          Ingredients
        </a>
        <a
          href="/parties"
          class="nav-link"
          class:active={$page.url.pathname === '/parties'}
          data-sveltekit-preload-data="hover"
        >
          Parties
        </a>
      </nav>
    </div>
  </div>
</header>

<style>
  .nav-link {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s;
  }

  .nav-link:hover {
    color: #2563eb;
    background-color: #f3f4f6;
  }

  .nav-link.active {
    color: #2563eb;
    background-color: #eff6ff;
  }
</style>
