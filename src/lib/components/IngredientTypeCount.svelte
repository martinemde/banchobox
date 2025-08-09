<script lang="ts">
  export let count: number;
  export let icon: any | null = null;
  export let title: string = '';
  export let size: number = 16;
</script>

<span
  class="inline-flex items-center gap-x-1"
  title={title ? `${title} ×${count}` : `×${count}`}
  aria-label={title ? `${title} ×${count}` : `×${count}`}
>
  <strong class="tabular-nums">{count}</strong>
  {#if icon}
    {@const Icon = icon}
    <Icon size={size} class="opacity-70" />
  {/if}
</span>
