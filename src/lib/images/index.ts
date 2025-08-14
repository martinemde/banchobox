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
  if (!filename) throw new Error('rawImageUrlForFile: filename is required');
  const thumb = thumbnailByBasename[filename];
  if (thumb) return thumb;
  return `/images/${filename.includes('/') ? filename : `thumbnails/${filename}`}`;
}

export const thumbnailMap = thumbnailByBasename;
