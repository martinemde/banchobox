<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary-500">About Bancho Box</h1>
	</div>

	<div class="variant-glass-surface space-y-6 card p-8">
		<p class="text-on-surface-token/90 text-lg">
			Bancho Box is a comprehensive database application for <strong class="text-primary-500"
				>Dave the Diver</strong
			>, built with modern web technologies to help players navigate the game's complex culinary
			system.
		</p>

		<div class="space-y-4">
			<h2 class="text-on-surface-token text-2xl font-bold">Features</h2>
			<ul class="text-on-surface-token/75 ml-4 list-inside list-disc space-y-2">
				<li>Complete dish database with unlock conditions, pricing, and party bonuses</li>
				<li>Comprehensive ingredient catalog with sources and gathering information</li>
				<li>Party event listings with associated dishes and bonus multipliers</li>
				<li>Dark/light theme support for comfortable viewing</li>
				<li>Responsive design for desktop and mobile devices</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-on-surface-token text-2xl font-bold">Technology Stack</h2>
			<p class="text-on-surface-token/75">
				This application is built with <a
					href="https://svelte.dev/docs/kit"
					class="text-primary-500 underline hover:text-primary-400">SvelteKit</a
				>
				and styled with
				<a href="https://skeleton.dev" class="text-primary-500 underline hover:text-primary-400"
					>Skeleton UI</a
				>
				for a modern, accessible user experience.
			</p>
		</div>
	</div>
</div>
