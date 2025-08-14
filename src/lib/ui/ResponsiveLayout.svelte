<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    left,
    content,
    right,
    title,
    leftTitle = 'Filters & sort',
    containerClass = ''
  }: {
    left?: Snippet;
    content?: Snippet;
    right?: Snippet;
    title?: Snippet;
    leftTitle?: string;
    containerClass?: string;
  } = $props();

  let leftDialogRef: HTMLDialogElement | null = $state(null);
</script>

<div class="px-4 py-6 md:h-[100dvh] md:overflow-hidden {containerClass}">
  <div class="md:grid md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_288px] md:gap-6 md:h-full">
    <div class="md:hidden mb-4">
      <button class="btn btn-lg preset-filled w-full" onclick={() => (leftDialogRef as HTMLDialogElement)?.showModal()}>
        {#if title}
          {@render title!()}
        {:else}
          {leftTitle}
        {/if}
      </button>
    </div>

    <aside class="hidden md:block md:h-full md:overflow-auto">
      <div class="card variant-glass-surface p-4 border border-white/10 top-0">
        {@render left!()}
      </div>
    </aside>

    <section class="md:h-full md:overflow-y-auto">
      <div class="mx-auto md:mx-0 max-w-[400px] w-full">
        {@render content!()}
      </div>
    </section>

    {#if right}
      <aside class="hidden lg:block md:h-full md:overflow-auto">
        {@render right!()}
      </aside>
    {/if}
  </div>

  <dialog bind:this={leftDialogRef} class="left-drawer modal md:hidden">
    <div class="drawer-panel card variant-glass-surface p-4 h-dvh w-[min(92vw,360px)] overflow-auto">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">
          {#if title}
            {@render title!()}
          {:else}
            {leftTitle}
          {/if}
        </h3>
        <button class="btn btn-sm preset-tonal" onclick={() => (leftDialogRef as HTMLDialogElement)?.close()}>Close</button>
      </div>
      {@render left!()}
    </div>
  </dialog>
</div>

<style>
  dialog.left-drawer {
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    /* Hidden by default; shown only on small screens when [open] */
    display: none;
  }
  @media (max-width: 767px) {
    dialog.left-drawer[open] {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: stretch;
    }
  }
  dialog.left-drawer::backdrop { background: rgba(0,0,0,0.5); }
  .drawer-panel { margin: 0; height: 100dvh; }
</style>
