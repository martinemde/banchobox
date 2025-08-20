<script lang="ts">
	import { Star } from '@lucide/svelte';

	let {
		checked = $bindable(false),
		disabled = false,
		onchange = undefined as undefined | ((checked: boolean) => void)
	} = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

<button
	type="button"
	class="badge-icon inline-flex items-center justify-center {checked
		? 'preset-filled-secondary-500'
		: 'preset-filled-surface-100-900'}"
	title={checked ? 'Untrack' : 'Track'}
	aria-label={checked ? 'Untrack' : 'Track'}
	aria-pressed={checked}
	{disabled}
	onclick={toggle}
>
	{#if checked}
		<Star size={24} fill="currentColor" class="text-on-surface-500" />
	{:else}
		<Star size={24} />
	{/if}
</button>

<style>
</style>
