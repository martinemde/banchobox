<script lang="ts">
	import { Globe } from '@lucide/svelte';
	import { currentLanguage, setLanguage, supportedLanguages, type Language } from './index.js';

	let isOpen = $state(false);

	function handleLanguageChange(lang: Language) {
		setLanguage(lang);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (event.target && !(event.target as Element).closest('.language-switcher')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="language-switcher relative">
	<button
		class="variant-ghost-surface btn flex items-center gap-1 btn-sm px-2"
		aria-label="Change language"
		onclick={toggleDropdown}
	>
		<Globe size={16} />
		<span class="hidden text-xs sm:inline">{supportedLanguages[$currentLanguage]}</span>
	</button>

	{#if isOpen}
		<div
			class="variant-filled-surface border-surface-300-600-token absolute right-0 z-50 mt-2 min-w-32 rounded-lg border p-2 shadow-xl"
		>
			<div class="space-y-1">
				{#each Object.entries(supportedLanguages) as [lang, label]}
					<button
						class="btn w-full justify-start text-sm"
						class:variant-filled-primary={$currentLanguage === lang}
						class:variant-ghost-surface={$currentLanguage !== lang}
						onclick={() => handleLanguageChange(lang as Language)}
					>
						{label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
