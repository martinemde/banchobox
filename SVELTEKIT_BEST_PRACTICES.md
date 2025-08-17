# BEST_PRACTICES.md

### Scope

- Svelte 5 (runes) and SvelteKit 2.
- Static-first, fast initial load, ergonomic navigation.
- Works well on Cloudflare and static hosts.

## Svelte 5 component best practices

### Reactivity and state

- Use runes; prefer simple JS where possible.
  - $state: deep reactive proxies for arrays/objects. Use direct mutation (e.g. arr.push).
  - $state.raw: for large immutable structures; update by reassignment only.
  - $state.snapshot(x): pass plain values to third-party APIs or `structuredClone`.
  - $derived(expr | by(() => ...)): compute from tracked inputs; side-effect free.
  - Don’t destructure reactive values if you expect reactivity to update destructured refs.
  - When passing reactive state into functions that must track current values, pass getters or use classes with reactive fields.
- Classes
  - Use `$state` in class fields or as the first assignment in the constructor to make fields reactive.

### Effects

- Treat `$effect` as an escape hatch (DOM APIs, canvas, analytics). Avoid synchronizing state with effects.
- Do not mutate state inside effects unless necessary; avoid feedback loops; use `untrack` if you must read+write the same state.
- Effect dependencies are tracked from synchronous reads; async reads (after await/setTimeout) are not tracked.
- Cleanup via returned function. Effects re-run after DOM updates and are batched.

### Props and bindings

- Use `$props()` to receive props; do not mutate props.
- For two-way binding, mark prop with `$bindable()` and parent binds with `bind:prop`.
- Use default values via destructuring: `let { p = 'default' } = $props();`.

### Events and actions/attachments

- Event handlers are delegated; touch handlers are passive for perf. If you need preventDefault on touch events, use `on(...)` via an action.
- Prefer attachments (`{@attach ...}`) in Svelte 5 for composable, fully reactive behavior. Use actions (`use:`) where appropriate; drive lifecycle with `$effect`.

### Lists and DOM

- Use keyed each blocks when items can be reordered for correct DOM updates and animations.
- Avoid unnecessary wrappers; prefer semantic markup.

### Unsafe HTML

- Use `{@html ...}` only with sanitized/escaped content. Never render untrusted strings. Enforce XSS hygiene.

### Context

- Use `setContext/getContext` to avoid prop drilling. Wrap in typed helper functions for type safety.

## SvelteKit best practices

### Routing, pages, and layouts

- Co-locate `+page.svelte` with `+page.js` or `+page.server.js`.
- Use `+layout.svelte` to keep shared UI; include `{@render children()}`. Nest layouts as needed.

### Data loading

- Choose `load` placement intentionally:
  - `+page.server.js` when you need server-only dependencies or private env.
  - `+page.js` for universal fetches that can run server or client.
- Return only `devalue`-serializable data.
- Use the special `fetch` in load/server hooks for relative URLs and credential forwarding.
- Propagate upstream caching to HTML using `setHeaders({ 'cache-control': ..., age: ... })` when appropriate.

### Rendering modes

- Use page options:
  - `export const prerender = true | false | 'auto'`.
  - `export const ssr = true | false`.
  - `export const csr = true | false`.
- Static sites: enable prerender globally in the root `+layout.(server.)js` and disable selectively where dynamic rendering is required.
- Avoid client JS for content-only pages with `csr = false`.

### Navigation and preloading

- Keep default body preloading:
  - In `src/app.html`: `<body data-sveltekit-preload-data="hover">`.
- Dial preloading per-link/region:
  - `data-sveltekit-preload-data="hover" | "tap" | false`.
  - `data-sveltekit-preload-code="eager" | "viewport" | "hover" | "tap" | false`.
- Use `data-sveltekit-reload` to force server navigations; `data-sveltekit-keepfocus` and `data-sveltekit-noscroll` for UX control.
- Programmatic helpers: `$app/navigation` (`goto`, `preloadData`, `preloadCode`, `invalidate`, `invalidateAll`, `afterNavigate`, `beforeNavigate`).
- Use `$app/state` (`page`, `updated`) in components; do not use deprecated `$app/stores` in new code.

### Environment variables and server-only code

- Prefer `$env/static/*` for build-time variables:
  - `$env/static/private` for secrets (server-only).
  - `$env/static/public` for safe client-exposed values (prefix `PUBLIC_` or configured `publicPrefix`).
- `$env/dynamic/*` are runtime values; they cannot be used during prerender. Use static variants for prerendered pages.
- Keep secrets in server-only modules; never import them in client code. Use SvelteKit server-only enforcement.

### Images and static assets

- Use Vite’s asset handling for imported assets; URLs get hashed and small assets inlined.
- Optimize images:
  - For build-time assets: `@sveltejs/enhanced-img` to emit `<picture>`, set width/height, generate multiple sizes, and serve AVIF/WebP.
  - For runtime/CDN images: use a CDN transformer (`@unpic/svelte` or provider SDK). Prefer `<img>` with CDN-driven content negotiation.
- Serve images via CDN/edge where possible.

### Caching, headers, and Cloudflare specifics

- Cloudflare `_headers`/`_redirects` apply only to static assets; dynamic responses must set headers in endpoints/hooks or via `setHeaders` in load.
- Co-locate your frontend and backend at the same region/edge where possible. Prefer HTTP/2+ for parallel asset loading.

### CSP and security

- Configure `kit.csp` with directives; SvelteKit will add nonces/hashes as needed (`mode: 'auto'` is recommended).
- Use `%sveltekit.nonce%` in `src/app.html` for manually inlined scripts/links.
- If using transitions that inject inline styles, allow them via `style-src` or accept `unsafe-inline`.
- Avoid injecting third-party scripts without explicit CSP allowances.

### Deployment and paths

- Prefer `adapter-cloudflare` for Workers/Pages; use `adapter-static` for fully prerendered sites.
- Understand relative vs absolute paths (`paths.relative`); use `$app/paths` helpers when generating URLs programmatically.

### Progressive enhancement and forms

- Use `<form>` with actions in `+page.server.js` for mutations. Enhance with `$app/forms` when needed.
- For GET forms, the router honors link options like `data-sveltekit-reload` and `data-sveltekit-noscroll`.

### Performance checklist

- Prerender as much as possible; limit JS with `csr = false` where feasible.
- Keep components small; hoist heavy logic to server `load`.
- Preload data/code by default (`hover`), override for costly pages.
- Cache and reuse fetches; bubble `Cache-Control` with `setHeaders`.
- Optimize the worst image offenders first; prefer AVIF/WebP and responsive sizes.
- Avoid unnecessary `$effect`; prefer derived state and pure computations.
- Avoid prop mutation; use bindings for two-way flow only when necessary.

## Snippets

```html
<!-- src/app.html -->
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
```

```js
// src/routes/+layout.server.js (example defaults)
export const prerender = true; // prerender everything by default
```
