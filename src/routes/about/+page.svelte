<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-primary-500 mb-4">About Dave Menu</h1>
	</div>

	<div class="card variant-glass-surface p-8 space-y-6">
		<p class="text-lg text-on-surface-token/90">
			Dave Menu is a comprehensive database application for <strong class="text-primary-500">Dave the Diver</strong>,
			built with modern web technologies to help players navigate the game's complex culinary system.
		</p>

		<div class="space-y-4">
			<h2 class="text-2xl font-bold text-on-surface-token">Features</h2>
			<ul class="list-disc list-inside space-y-2 text-on-surface-token/75 ml-4">
				<li>Complete dish database with unlock conditions, pricing, and party bonuses</li>
				<li>Comprehensive ingredient catalog with sources and gathering information</li>
				<li>Party event listings with associated dishes and bonus multipliers</li>
				<li>Dark/light theme support for comfortable viewing</li>
				<li>Responsive design for desktop and mobile devices</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-2xl font-bold text-on-surface-token">Technology Stack</h2>
			<p class="text-on-surface-token/75">
				This application is built with <a href="https://svelte.dev/docs/kit" class="text-primary-500 hover:text-primary-400 underline">SvelteKit</a>
				and styled with <a href="https://skeleton.dev" class="text-primary-500 hover:text-primary-400 underline">Skeleton UI</a>
				for a modern, accessible user experience.
			</p>
		</div>
	</div>
</div>
