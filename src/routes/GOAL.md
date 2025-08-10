**Goal**

Implement a reusable “entity bundle + stores” pattern for client-side filtering, sorting, and search. Start with **Dishes** and keep the code structured so we can add **Ingredients/Parties** later with minimal duplication. Compute the **DishBundle** (rows = Dish, plus search, sort, byId, facets) at **build time** and ship it as a static JSON. Update the /dishes page to consume the bundle via stores.

**Key constraints from current repo:**

- Enrichment already happens in scripts/build/enrich.ts producing arrays: dishes, ingredients, parties, partyDishes.
- Static export happens in scripts/build/export.ts → writes *.v1.json files to static/data.
- Loader is src/routes/+layout.ts (client-side fetch; SSR-guard).
- Runtime service is in src/lib/data/runtime.ts (the Data singleton).
- Root loader is **src/routes/+layout.ts**; it fetches the four JSON files browser-side and returns them.
- We **will extend the existing Dish type** with search and sort, and **we will generate facets** at build time.

Implement the feature in **small, reviewable steps**. Include TypeScript types. It is ok to replace without backwards compatibility since the application is not used in production yet, meaning we don't need to version.

## **Step 1 — Types: extend**  **Dish**  **with search/sort keys**

Update src/lib/types.ts:

```
export type SortKey =
  | 'name'
  | 'finalPrice'
  | 'finalServings'
  | 'profitPerServing'
  | 'maxProfitPerServing'
  | 'maxProfitPerDish'
  | 'upgradeCost'
  | 'ingredientCount';

export interface Dish {
  // existing enriched fields...
  search: string; // normalized tokens (name, dlc, unlock, ingredient names)
  sort: Record<SortKey, string | number>;
}
```

## Step 2 — Compute search and sort in enrich.ts

In scripts/build/enrich.ts, when creating each enrichedDish, add:

```
const ingredientNames = ingredientLines
  .map((l) => graph.ingById.get(l.ingredientId)?.name || '')
  .filter(Boolean);

const normalize = (s: unknown) => (s ?? '').toString().toLowerCase();

const search = [
  dish.name,
  dish.dlc,
  dish.unlock,
  ...ingredientNames
].map(normalize).join(' ');

const sort = {
  name: normalize(dish.name),
  finalPrice: dish.finalPrice,
  finalServings: dish.finalServings,
  baseProfitPerServing,
  maxProfitPerServing,
  maxProfitPerDish,
  upgradeCost,
  ingredientCount
} as const;

const enrichedDish: Dish = {
  // existing fields...
  search,
  sort
};
```

## Step 3 — Build the Dish bundle at export time

Create scripts/build/dish_bundle.ts with a helper to construct the bundle:

```
// scripts/build/dish_bundle.ts
import type { Dish, Ingredient, Id } from '../../src/lib/types.js';

export type Facets = Record<string, Record<string, Id[]>>;

export function buildDishesBundle(dishes: Dish[], ingredients: Ingredient[]) {
  // byId
  const byId = Object.fromEntries(dishes.map(d => [d.id, d])) as Record<Id, Dish>;

  // facets
  const facets: Facets = {
    dlc: {},                 // e.g., "base", "DLC1", ...
    hasIngredient: {}        // ingredientId -> [dishIds]
  };

  for (const d of dishes) {
    const dlcVal = (d.dlc ?? 'base').toString();
    (facets.dlc[dlcVal] ??= []).push(d.id);

    for (const line of d.ingredients) {
      const key = String(line.ingredientId);
      (facets.hasIngredient[key] ??= []).push(d.id);
    }
  }

  return {
    rows: dishes, // Dish already includes search/sort
    byId,
    facets
  };
}
```

- Implementation details:
    - **Project** each BasicDish to Dish adding only the enhanced fields we use for display.
    - ingredientIds from dishIngredients.map(i => i.ingredientId)
    - search string: lowercased concat of name, dlc, unlock, plus each **ingredient name** (resolve via ingredients), space separated.
    - byId: map of id -> Dish (same data as rows, this is our id index)
    - facets:
        - dlc: value = the DLC string or 'base' if null.
		- unlock: value = the unlock condition string
        - (Keep it easy to extend; don’t over-index yet.)

- Unit tests to validate:
    - search string contains dish + ingredient tokens,
    - facets build correct id lists,
    - sort keys exist and have primitive values.

## **Step 4 — Export the dishes bundle

In scripts/build/export.ts write a **bundle** file, keeping the other files the same for now, it's ok to replace the existing dishes json export since we're replacing the behavior on a system not yet in production:

```
import { buildDishesBundle } from './dish_bundle.js';

// ... existing exports

const dishesBundle = buildDishesBundle(dishes, ingredients);
writeFileSync(join(outputDir, `dishes.${version}.json`), JSON.stringify(dishesBundle, null, 1));
```

## Step 4.5 Create a generic entity store factory and a dishes namespace

**File:** src/lib/stores/entityBundle.ts

- Export createEntityStores<Row>() that returns:

```
export interface EntityStores<Row extends { id: Id; sort: Record<string, any>; search?: string }> {
  bundle: Writable<{ rows: Row[]; byId: Record<Id, Row>; facets: Record<string, Record<string, Id[]>> } | null>;
  query: Writable<string>;
  sortKey: Writable<string>;
  sortDir: Writable<'asc' | 'desc'>;
  filters: Writable<Record<string, Set<string>>>;
  visible: Readable<Row[]>;
}
```

- Implementation:
    - visible = derived([bundle, query, sortKey, sortDir, filters], ...):
        1. Start from facet candidate ids (OR within facet, AND across facets).
        2. Map to rows.
        3. If query, filter rows where row.search.includes(q).
        4. rows.sort using row.sort[sortKey] (stable tie-break by row.id).
- Keep comparison generic for string | number.


## Step 5 — Loader: fetch the bundle and arrays as before

Update src/routes/+layout.ts to include the **bundle**:

```
export const prerender = true;

type LoaderResult = {
  ingredients?: Ingredient[];
  parties?: EnrichedParty[];
  partyDishes?: PartyDish[];
  dishesBundle?: {
    rows: Dish[];
    byId: Record<string, Dish>;
    facets: Record<string, Record<string, string[]>>;
  };
};

export const load: (event: Parameters<LayoutServerLoad>[0]) => Promise<LoaderResult> = async ({ fetch }) => {
  if (typeof window === 'undefined') return {};

  const [dishes, ingredients, parties, partyDishes, dishesBundle] = await Promise.all([
    fetch('/data/dishes.v1.json').then(r => r.json())
    fetch('/data/ingredients.v1.json').then(r => r.json()),
    fetch('/data/parties.v1.json').then(r => r.json()),
    fetch('/data/party-dishes.v1.json').then(r => r.json()),
  ]);

  return { ingredients, parties, partyDishes, dishesBundle };
};
```

## Step 6 — Stores: consume the prebuilt bundle

Create src/lib/stores/dishes.ts:

- export dishesStores = createEntityStores<Dish>().
- Export helpers:

```
export function setDishSort(key: string, dir: 'asc'|'desc' = 'asc') { ... }
export function clearDishFilters() { ... }
```

- Provide **default** sort (match the current page behavior)

---


## Step 7 — Hydrate stores from layout data

In src/routes/+layout.svelte, after you call Data.init, set the dishes bundle:

```
<script lang="ts">
  export let data;
  import { Data } from '$lib/data/runtime.js';
  import { bundle as dishesBundleStore } from '$lib/stores/dishes';

  $: if (data?.dishes && data?.ingredients && data?.parties && data?.partyDishes) {
    Data.init({
      ingredients: data.ingredients,
      parties: data.parties,
      partyDishes: data.partyDishes
    });
  }

  $: if (data?.dishesBundle) {
    dishesBundleStore.set(data.dishesBundle);
  }
</script>

<slot />
```

## Step 8 — Page: use the store

- Keep the head/meta and your DishCard component.
- Replace local sorting/search logic with the store API:
    - bind an <input> to dishesStores.query
    - bind simple controls to dishesStores.sortKey / dishesStores.sortDir
    - iterate $dishesStores.visible

Minimal diff (conceptually):

```
<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import { dishesStores } from '$lib/stores/dishes';

  // For options, reuse your same list of sort keys but they must exist in row.sort
  const sortOptions = [
    { value: 'name', label: 'Recipe' },
    { value: 'finalPrice', label: 'Final Price' },
    { value: 'finalServings', label: 'Final Servings' },
    { value: 'baseProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'maxProfitPerDish', label: 'Max Profit / Dish' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
    { value: 'ingredientCount', label: 'Ingredients' }
  ];
</script>

<div class="controls">
  <input
    type="search"
    placeholder="Search dishes by name, ingredient, DLC, unlock…"
    bind:value={$dishesStores.query}
  />

  <select bind:value={$dishesStores.sortKey}>
    {#each sortOptions as o}
      <option value={o.value}>{o.label}</option>
    {/each}
  </select>

  <button on:click={() => dishesStores.sortDir.set($dishesStores.sortDir === 'asc' ? 'desc' : 'asc')}>
    {$dishesStores.sortDir.toUpperCase()}
  </button>
</div>

<ol class="card-list">
  {#each $dishesStores.visible as row (row.id)}
    <li><Dish dish={row} /></li>
  {/each}
</ol>
```

- Remove sortDishes, dishMatchesQuery, and local $state/$derived for sorting/search, those responsibilities now live in the store layer.

## **Add a tiny URL sync helper**

So views are shareable and resume on refresh:

- Create src/lib/stores/urlSync.ts (as discussed previously) that watches query/sortKey/sortDir/filters and reflects them to ?dishes.q=&dishes.sortKey=&... using goto(..., { replaceState: true }).
- Call it once in +page.svelte:

```
<script>
  import { syncToUrl } from '$lib/stores/urlSync';
  import { dishesStores } from '$lib/stores/dishes';
  syncToUrl('dishes', dishesStores);
</script>
```

## **Acceptance**

- /dishes renders the same list of cards as before by default, ordered by **profitPerServing desc**.
- Search matches dish name/DLC/unlock/ingredient names using the **prebuilt** search field.
- Changing the sort key/direction updates **immediately** across the page with no component-level sorting logic.
- Reloading the page with params preserves filters/sort/search.
- Facets (e.g., dlc and unlock) filter instantly via the **prebuilt** inverted indexes.
- No server-side embedding of large datasets (HTML remains small); JSON remains network-cached.
- No TypeScript errors; new modules have types.
- Code is structured so adding **Ingredients/Parties** later is:
    1. add a buildXBundle function,
    2. add xStores = createEntityStores<Row> instance,
    3. hydrate in layout,
    4. consume $xStores.visible in the page.

## **Notes about current files (keep in mind)**

- src/routes/+layout.ts: switch to LayoutLoad and relax LoaderResult (optional but avoids the {} type mismatch when SSR short-circuits).
- src/lib/data/runtime.ts: keep it; it remains a useful thin cache. Stores sit on top.

---

That’s it. Please implement as described and keep changes minimal.
