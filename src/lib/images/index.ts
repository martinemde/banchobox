// Build-time map of image URLs for Dave images
// We store files under `src/lib/images/dave/*.png` and reference by normalized name

// Using Vite's import.meta.glob to eagerly import URLs for all PNGs in the directory
// Note: 'as' has been deprecated; use 'query' + 'import' instead
const daveImages = import.meta.glob('/src/lib/images/dave/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
});

/**
 * Convert a dish or ingredient name to the canonical filename used for the image.
 * Rules: spaces -> underscore, apostrophes -> underscore, plus ".png" suffix.
 */
export function toImageFileName(name: string): string {
	const base = name.replace(/[ '\u2019]/g, '_');
	return `${base}.png`;
}

/**
 * Return the image URL for a given dish or ingredient name, or undefined if not found.
 */
export function imageUrlForName(name: string): string | undefined {
	const filename = toImageFileName(name);
	const key = `/src/lib/images/dave/${filename}`;
	const found = daveImages[key] as unknown as string | undefined;
	return found;
}
