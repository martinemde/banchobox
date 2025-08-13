// Raw asset URL registries (no enhanced image handling)
const thumbnailUrlModules = import.meta.glob(
  '/src/lib/images/thumbnails/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
  { eager: true, query: '?url', import: 'default' }
);

const uiUrlModules = import.meta.glob(
  '/src/lib/images/ui/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
  { eager: true, query: '?url', import: 'default' }
);

const allUrlModules = {
  ...thumbnailUrlModules,
  ...uiUrlModules
} as Record<string, string>;

// Resolve a raw asset URL for a given filename (e.g. "foo.png" or "ui/foo.png")
export function rawImageUrlForFile(filename: string | null | undefined): string {
  if (!filename) throw new Error('rawImageUrlForFile: filename is required');

  const candidateKeys: string[] = [];
  if (filename.includes('/')) {
    candidateKeys.push(`/src/lib/images/${filename}`);
  }
  candidateKeys.push(`/src/lib/images/thumbnails/${filename}`);

  for (const key of candidateKeys) {
    const url = allUrlModules[key];
    if (url) return url;
  }

  throw new Error(
    `rawImageUrlForFile: image not found for candidates: ${candidateKeys.join(', ')}`
  );
}

// Deprecated: kept for temporary compatibility while migrating callsites
export function toImageFileName(name: string): string {
  const base = name.replace(/[ '\u2019]/g, '_').toLowerCase();
  return `${base}.png`;
}
