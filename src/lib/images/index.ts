// Enhanced image modules for thumbnails (processed at build via @sveltejs/enhanced-img)
const thumbnailEnhancedModules = import.meta.glob(
  '/src/lib/images/thumbnails/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
  {
    eager: true,
    query: {
      enhanced: true
    }
  }
);

// Local alias mirroring the plugin's accepted object form for <enhanced:img>
export type ImageSource = string;

// Resolve an enhanced image module's default export for a given filename
export function enhancedImageForFile(filename: string | null | undefined): string {
  if (!filename) throw new Error('enhancedImageForFile: filename is required');
  const key = `/src/lib/images/thumbnails/${filename}`;
  const mod = thumbnailEnhancedModules[key] as { default?: unknown } | unknown | undefined;
  if (mod == null) {
    throw new Error(`enhancedImageForFile: image not found for key ${key}`);
  }
  // Some bundlers expose the processed artifact at default, others inline it
  if (typeof mod === 'object' && mod !== null && 'default' in mod) {
    return (mod as { default: unknown }).default as unknown as string;
  }
  return mod as unknown as string;
}


// Deprecated: kept for temporary compatibility while migrating callsites
export function toImageFileName(name: string): string {
  const base = name.replace(/[ '\u2019]/g, '_').toLowerCase();
  return `${base}.png`;
}
