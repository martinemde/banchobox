<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Dialog } from 'bits-ui';

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

  // Bits UI Dialog manages its own open state via Trigger/Close
</script>

<div class="flex-1 px-4 py-6 md:h-[100dvh] {containerClass}">
  <div class="md:flex md:gap-6 md:h-[calc(100dvh-3rem)]">
    <Dialog.Root>
      <div class="md:hidden mb-4">
        <Dialog.Trigger class="btn btn-lg preset-filled w-full">
          {#if title}
            {@render title!()}
          {:else}
            {leftTitle}
          {/if}
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 md:hidden" />
        <Dialog.Content class="fixed left-0 top-0 z-50 md:hidden">
          <div class="drawer-panel card variant-glass-surface bg-surface-100-900 pt-20 pb-10 px-4 h-dvh w-[min(92vw,360px)] overflow-auto">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold">
                {#if title}
                  {@render title!()}
                {:else}
                  {leftTitle}
                {/if}
              </h3>
              <Dialog.Close class="btn btn-sm preset-tonal">Close</Dialog.Close>
            </div>
            {@render left!()}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    <aside class="hidden md:block md:w-72 md:shrink-0 md:h-full md:overflow-auto">
      <div class="h-full px-4 border-r border-white/10 top-0">
        {@render left!()}
      </div>
    </aside>

    <section class="md:min-w-0 md:h-full">
      {@render content!()}
    </section>

    {#if right}
      <aside class="hidden lg:block lg:w-64 md:shrink-0 md:h-full md:overflow-auto">
        {@render right!()}
      </aside>
    {/if}
  </div>

</div>

<style>
  .drawer-panel { margin: 0; height: 100dvh; }
</style>
