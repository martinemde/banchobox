<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let checked: boolean = false;
	export let label: string = 'track';

	const dispatch = createEventDispatcher<{ change: { checked: boolean } }>();

	function toggle() {
		checked = !checked;
		dispatch('change', { checked });
	}
</script>

<button
	type="button"
	class="btn inline-flex w-full items-center justify-start preset-filled-surface-500 btn-sm text-xs"
	aria-pressed={checked}
	on:click={toggle}
>
	<input
		type="checkbox"
		bind:checked
		tabindex="-1"
		aria-hidden="true"
		class="pointer-events-none checkbox size-4"
	/>
	<span class="text-xs">{label}</span>
</button>

<style>
</style>
