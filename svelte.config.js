import { mdsvex } from 'mdsvex';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		// Use static adapter for iOS builds so we can bundle the app offline in WKWebView
		adapter: process.env.IOS_BUILD
			? adapterStatic({
					pages: 'ios/BanchoBox/BanchoBox/Web',
					assets: 'ios/BanchoBox/BanchoBox/Web',
					fallback: 'index.html',
					strict: true
				})
			: adapterAuto(),
		paths: {
			relative: Boolean(process.env.IOS_BUILD)
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
