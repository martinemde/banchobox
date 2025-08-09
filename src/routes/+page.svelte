<script lang="ts">
  import { goto } from '$app/navigation';
  import { Data } from '$lib/data/runtime.js';

  $: dishes = Data.dishes;
  $: ingredients = Data.ingredients;
  $: parties = Data.parties;
</script>

<svelte:head>
  <title>Bancho Box - Dave the Diver Complete Database</title>
  <meta name="description" content="Complete dish, ingredient and party collection from Dave the Diver" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="text-center mb-12">
    <h1 class="text-6xl font-bold text-primary-500 mb-4">Bancho Box</h1>
    <p class="text-xl text-on-surface-token max-w-2xl mx-auto">
      Your complete database for dishes, ingredients, and party bonuses from Dave the Diver
    </p>
  </div>

  <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    <!-- Dishes Card -->
    <div
      class="card variant-glass-surface p-8 text-center rounded-xl shadow-md hover:shadow-xl transition cursor-pointer bg-white/10 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/20 flex flex-col h-full"
      role="link"
      tabindex="0"
      onclick={() => goto('/dishes')}
      onkeydown={(e) => e.key === 'Enter' && goto('/dishes')}
    >
      <div class="mb-6">
        <div class="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-on-surface-token mb-2">Dishes</h2>
        <p class="text-on-surface-token/75 mb-4">
          Browse all {dishes.length} dishes with detailed information about levels, prices, and requirements
        </p>
      </div>
      <button type="button" class="btn btn-lg preset-filled w-full mt-auto" onclick={() => goto('/dishes')}>
        View All Dishes
      </button>
    </div>

    <!-- Ingredients Card -->
    <div
      class="card variant-glass-surface p-8 text-center rounded-xl shadow-md hover:shadow-xl transition cursor-pointer bg-white/10 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/20 flex flex-col h-full"
      role="link"
      tabindex="0"
      onclick={() => goto('/ingredients')}
      onkeydown={(e) => e.key === 'Enter' && goto('/ingredients')}
    >
      <div class="mb-6">
        <div class="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-on-surface-token mb-2">Ingredients</h2>
        <p class="text-on-surface-token/75 mb-4">
          Explore all {ingredients.length} ingredients with source locations, types, and gathering information
        </p>
      </div>
      <button type="button" class="btn btn-lg preset-filled w-full mt-auto" onclick={() => goto('/ingredients')}>
        View All Ingredients
      </button>
    </div>

    <!-- Parties Card -->
    <div
      class="card variant-glass-surface p-8 text-center rounded-xl shadow-md hover:shadow-xl transition cursor-pointer bg-white/10 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/20 flex flex-col h-full"
      role="link"
      tabindex="0"
      onclick={() => goto('/parties')}
      onkeydown={(e) => e.key === 'Enter' && goto('/parties')}
    >
      <div class="mb-6">
        <div class="w-16 h-16 bg-tertiary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-on-surface-token mb-2">Parties</h2>
        <p class="text-on-surface-token/75 mb-4">
          Discover all {parties.length} party events with bonuses and associated dishes
        </p>
      </div>
      <button type="button" class="btn btn-lg preset-filled w-full mt-auto" onclick={() => goto('/parties')}>
        View All Parties
      </button>
    </div>
  </div>

  <div class="text-center mt-16">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-on-surface-token mb-6">About Bancho Box</h2>
      <p class="text-lg text-on-surface-token/75 leading-relaxed">
        Bancho Box is a comprehensive database for Dave the Diver, featuring detailed information about
        dishes, ingredients, and party events. Whether you're planning the perfect restaurant menu or
        looking for specific ingredients, this tool helps you navigate the depths of Dave's culinary world.
      </p>
    </div>
  </div>
</div>
