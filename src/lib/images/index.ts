// Basic PNG-only registries with hashed URLs via Vite
const thumbnailFiles = import.meta.glob('/src/lib/images/thumbnails/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

const thumbnailByBasename = Object.fromEntries(
	Object.entries(thumbnailFiles).map(([absPath, url]) => {
		const name = absPath.split('/').pop()!;
		return [name, url];
	})
) as Record<string, string>;

export function thumbnailUrl(name: string): string | undefined {
	return thumbnailByBasename[name];
}

export function rawImageUrlForFile(filename: string | null | undefined): string {
	const PLACEHOLDER =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AApMBgSijL7kAAAAASUVORK5CYII=';
	if (!filename) return PLACEHOLDER;
	const thumb = thumbnailByBasename[filename];
	if (thumb) return thumb;
	return PLACEHOLDER;
}

export const thumbnailMap = thumbnailByBasename;
