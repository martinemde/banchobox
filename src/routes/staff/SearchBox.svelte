<script lang="ts">
	import { Search, X } from '@lucide/svelte';

	let {
		value = '',
		onSearch,
		placeholder = 'Search...',
		debounceMs = 300
	}: {
		value?: string;
		onSearch: (query: string) => void;
		placeholder?: string;
		debounceMs?: number;
	} = $props();

	let inputValue = $derived(value);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;

		// Clear existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set new timer
		debounceTimer = setTimeout(() => {
			onSearch(inputValue);
		}, debounceMs);
	}

	function clearSearch() {
		inputValue = '';
		onSearch('');
	}
</script>

<div class="relative">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<Search size={18} class="opacity-50" />
	</div>

	<input
		type="text"
		value={inputValue}
		oninput={handleInput}
		{placeholder}
		class="ig-select w-full pr-10 pl-10"
		aria-label="Search"
	/>

	{#if inputValue}
		<button
			type="button"
			onclick={clearSearch}
			class="absolute inset-y-0 right-0 flex items-center pr-3 opacity-50 hover:opacity-100"
			aria-label="Clear search"
		>
			<X size={18} />
		</button>
	{/if}
</div>
