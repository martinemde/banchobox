<script lang="ts">
  /*
   * PixelIcon: crisp pixel-art renderer
   *
   * Intent
   * - Render small, pre-compressed pixel-art sprites at integer UI scales without blur.
   * - Preserve original source pixels (e.g., 32×32, 56×56) and avoid any resampling.
   *
   * How it works
   * - Uses a fixed 64×64 logical "tile" that is scaled by an integer or retina sub-pixel scaling factors.
   * - The <img> itself is not given width/height; it uses its intrinsic pixel size.
   * - The image is centered inside the 64×64 tile; small sprites remain small and centered.
   * - CSS image-rendering: pixelated/crisp-edges enforces nearest-neighbor where supported.
   * - URLs are resolved from a hashed thumbnail manifest at runtime; no responsive/enhanced pipeline.
   * - If an image name is missing, a transparent 1×1 is used to avoid layout shift.
   *
   * Why not typical optimized image rendering?
   * - Responsive srcsets/enhanced-image pipelines resample and smooth, which blurs pixel art.
   * - For pixel art we want exact, blocky pixels at integer scales, so we scale the tile, not the bitmap.
   */
  import { rawImageUrlForFile } from '$lib/images/index.js';
  let {
    image,
    alt,
    uiScale = 1,
    tile = 64
  } = $props<{
    image: string;
    alt: string;
    uiScale?: number; // integer scale of the 64×64 tile
    tile?: number; // base tile size; default 64
  }>();

  // Allow sub-pixel scaling at half-pixel increments since retina displays are common
  let scale = $derived(Math.max(0.5, Math.floor(uiScale * 2) / 2)); // 0.5, 1, 1.5, 2, 2.5, 3, etc.

  // Resolve CSV-provided image filename (e.g., "agar.png") to a hashed URL via import.meta.glob maps
  let src = $derived(rawImageUrlForFile(image));
</script>

<div class="tile rounded-md bg-surface-300-700" style={`--tile:${tile}px; --scale:${scale}`}>
  <div class="base">
    <img {src} {alt} decoding="async" loading="lazy" />
  </div>
</div>

<style>
  .tile {
    /* the box that should occupy layout */
    width: calc(var(--tile) * var(--scale));
    height: calc(var(--tile) * var(--scale));
    position: relative;
    overflow: hidden;
    display: block; /* grid not needed here */
    contain: layout paint size;
  }

  .base {
    /* the 64×64 logical frame, scaled and truly centered */
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--tile);
    height: var(--tile);
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%) scale(var(--scale));
    transform-origin: center;
  }

  /* pixel-art */
  .base img {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    max-width: 100%;
    max-height: 100%;
  }
</style>
