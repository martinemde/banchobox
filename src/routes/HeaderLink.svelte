<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';

	interface Props {
		href: string;
		icon: Component;
		label: string;
		class?: string;
	}

	let { href, icon: Icon, label, class: additionalClasses = '' }: Props = $props();

	const isActive = $derived(page.url.pathname === href);
	const selectedClasses = 'text-primary-500 bg-primary-50';
	const unselectedClasses = 'text-surface-600';
	const selectedSpanClasses = 'sm:inline';
</script>

<a
	{href}
	class="
		inline-flex items-center gap-2 rounded-md p-2 text-sm
		font-medium no-underline transition-colors duration-200
		hover:bg-surface-100 hover:text-primary-500 hover:no-underline sm:px-3
		{isActive ? selectedClasses : unselectedClasses}
		{additionalClasses}
	"
	data-sveltekit-preload-data="hover"
	aria-label={label}
>
	<Icon size={22} />
	<span class="label hidden md:inline {isActive ? selectedSpanClasses : ''}">{label}</span>
</a>
