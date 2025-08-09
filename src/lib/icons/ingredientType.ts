import {
  ArchiveRestore,
  ArchiveX,
  CookingPot,
  Carrot,
  Egg,
  Fish,
  FishOff,
  LeafyGreen,
  Loader,
  Shrimp,
  Snowflake,
  Sprout,
  Wheat,
} from '@lucide/svelte';

// Centralized mapping of ingredient type/source to an icon component
export function getIngredientTypeIcon(type?: string) {
  if (!type) return null;
  const key = type.toLowerCase();
  switch (key) {
    case 'aberration':
      return FishOff;
    case 'aberration crab':
      return ArchiveX;
    case 'crab trap':
      return ArchiveRestore;
    case 'egg':
      return Egg;
    case 'fish':
      return Fish;
    case 'jango':
      return Snowflake;
    case 'net':
      return Shrimp;
    case 'procure':
      return CookingPot;
    case 'rice':
      return Wheat;
    case 'sea plant':
    //   return Sprout
      return LeafyGreen;
    case 'vegetable':
      return Carrot;
    case 'urchin':
      return Loader;
    default:
      return null;
  }
}
