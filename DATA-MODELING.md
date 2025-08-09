## **0) Goals & constraints distilled**

- **Static site** (pre-rendered) with **client-side interactions** and persistence.

- CSV **source-of-truth** that changes rarely.

- **Relational joins** across Parties ↔ Dishes ↔ Ingredients for cross-cutting queries.

- **Avoid “big ugly” math** by isolating each calculation in **small pure functions**.

- Precompute “heavy, global invariants”; compute **per-user**, **selection-dependent** numbers on the fly.

---

## **1) Overall shape**

```
/scripts
  build-data.ts         # ETL: CSV -> normalized graph -> precomputed JSON bundles
/src/lib
  /types                # TS types, zod schemas
  /data                 # runtime loaders for JSON (thin)
  /calc                 # pure, unit-tested calculators (shared by build + client)
  /graph                # graph indices/selectors (shared by build + client)
  /stores               # Svelte stores & cookie/local persistence
/src/routes
  +layout.ts            # loads small indices; prerendered
  /dishes
  /ingredients
  /parties
/static/data            # emitted JSON assets (versioned, cacheable)
```

**Key idea:** put _all_ formulas into src/lib/calc/\* as tiny pure functions that accept only the inputs they need. Both the **build step** and the **client** import these same functions so there is **one source of truth** for the math.

---

## **2) Data flow (build-time ETL)**

**Source:** CSVs for dishes, ingredients, parties, dish_parties, dish_ingredients.

**Pipeline in /scripts/build-data.ts:**

1. **Parse & validate** each CSV with zod schemas to guarantee types.

2. **Normalize** into typed arrays (no computation yet).

3. Build a **Graph** (id maps + adjacency lists) for O(1)/O(n) lookups.

4. Run **precomputations** (see §4): values that don’t depend on user choices.

5. **Emit JSON bundles** (flat, denormalized where convenient) for the app.

You run it with pnpm build:data (before pnpm build). Because SvelteKit is static, we serve the JSON from /static/data.

### **Suggested emitted artifacts**

- dishes.json – each dish with:
  - base fields

  - ingredients[]: { ingredientId, count, unitCost, lineCost }

  - recipeCost

  - partyStats[]: { partyId, bonus, partyPrice, servings, profit }

  - bestParty: { partyId, bonus, profit }

  - maxProfitPerDish (same as bestParty.profit)

- ingredients.json – each ingredient with:
  - base fields

  - usedIn[]: { dishId, count }

  - bestDish: { dishId, partyId, profit } (see §4)

  - usedForParties[]: unique list of parties reachable via used dishes

- parties.json – each party with:
  - base fields

  - dishes[]: { dishId, partyPrice, profit } (precomputed via calculators)

- indices.json – small maps to speed routing & joins:
  - dishIdsByIngredientId

  - dishIdsByPartyId

  - (and/or embed these in the objects above if you prefer)

Keep each file reasonably sized; JSON compresses very well with brotli at the edge/CDN.

---

## **3) Types + Graph (used in build & client)**

```
// src/lib/types/core.ts
export type Id = number;

export interface Dish {
  id: Id; name: string;
  final_level: number; final_taste: number;
  initial_price: number; final_price: number;
  servings: number; unlock_condition?: string | null; dlc?: string | null;
}

export interface Ingredient {
  id: Id; name: string; source?: string; type?: string;
  drone: number; kg?: number | null; max_meats?: number | null; cost?: number | null;
}

export interface Party { id: Id; name: string; bonus: number; }

export interface DishIngredient { dish_id: Id; ingredient_id: Id; count: number; levels?: number | null; upgrade_count?: number | null; }
export interface DishParty      { dish_id: Id; party_id: Id; }
```

```
// src/lib/graph/index.ts
export interface Graph {
  dishes: Dish[]; ingredients: Ingredient[]; parties: Party[];
  dishIngredients: DishIngredient[]; dishParties: DishParty[];

  // Indexes:
  dishById: Map<Id, Dish>;
  ingById: Map<Id, Ingredient>;
  partyById: Map<Id, Party>;
  ingByDishId: Map<Id, {ingredient_id: Id; count: number}[]>;
  dishesByIngredientId: Map<Id, {dish_id: Id; count: number}[]>;
  partiesByDishId: Map<Id, Id[]>;
  dishesByPartyId: Map<Id, Id[]>;
}
```

Create the graph in one place (build step). In the client, you typically won’t reconstruct the whole graph, but you can expose thin selectors derived from the JSON (e.g., ingredientsByDishId(dishId)).

---

## **4) Calculators (small, pure, composable)**

**Keep every function tiny and testable.**

```
// src/lib/calc/price.ts
export const baseDishPrice = (dish: Dish) => dish.final_price;

export const partyPrice = (dish: Dish, party: Party) =>
  baseDishPrice(dish) * party.bonus;

export const revenuePerDish = (dish: Dish, party: Party) =>
  partyPrice(dish, party) * dish.servings;
```

```
// src/lib/calc/costs.ts
export const lineCost = (count: number, unitCost: number | null | undefined) =>
  count * (unitCost ?? 0);

export const recipeCost = (
  ingLines: { count: number; unitCost: number | null | undefined }[]
) => ingLines.reduce((sum, l) => sum + lineCost(l.count, l.unitCost), 0);
```

```
// src/lib/calc/profit.ts
import { revenuePerDish } from './price';
import { recipeCost }     from './costs';

export const profitPerDishForParty = (
  dish: Dish,
  party: Party,
  ingLines: { count: number; unitCost: number | null | undefined }[]
) => revenuePerDish(dish, party) - recipeCost(ingLines);
```

```
// src/lib/calc/best.ts
export const bestPartyForDish = (
  dish: Dish,
  parties: Party[],
  ingLines: { count: number; unitCost: number | null | undefined }[],
) => {
  let best = { partyId: parties[0].id, profit: Number.NEGATIVE_INFINITY };
  for (const p of parties) {
    const profit = profitPerDishForParty(dish, p, ingLines);
    if (profit > best.profit) best = { partyId: p.id, profit };
  }
  return best;
};

export const bestDishForIngredient = (
  ingredientId: Id,
  graph: Graph
) => {
  const uses = graph.dishesByIngredientId.get(ingredientId) ?? [];
  let best = { dishId: null as Id | null, partyId: null as Id | null, profit: Number.NEGATIVE_INFINITY };

  for (const { dish_id } of uses) {
    const dish = graph.dishById.get(dish_id)!;
    const parties = (graph.partiesByDishId.get(dish_id) ?? []).map(id => graph.partyById.get(id)!);
    const ingLines = (graph.ingByDishId.get(dish_id) ?? []).map(l => ({
      count: l.count,
      unitCost: graph.ingById.get(l.ingredient_id)?.cost ?? null
    }));
    const bestParty = bestPartyForDish(dish, parties, ingLines);
    if (bestParty.profit > best.profit) best = { dishId: dish_id, partyId: bestParty.partyId, profit: bestParty.profit };
  }
  return best;
};
```

> These calculators are tiny and composable; there’s no 200-line “do everything” function. You can add more (e.g., kg-based metrics) next to these.

**Unit-test** them with Vitest. Because the build step uses them too, tests give you a safety net for both build and runtime.

---

## **5) What to precompute vs compute on the fly**

| **Concern**                                                                                                                           | **Precompute?**              | **Reason**                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| **Per dish**: recipeCost, party prices/revenue/profit per party, bestParty, maxProfitPerDish                                          | **Yes**                      | Heavy, global invariants; independent of user choices.                             |
| **Per ingredient**: bestDish (dish + party + profit), usedInDishes, usedForParties                                                    | **Yes**                      | Cross-graph derived; queried often; static until data refresh.                     |
| **Per party**: list of dishes with partyPrice/profit sorted by profit                                                                 | **Yes**                      | Speeds party views and “what to cook for this party?”                              |
| **Per-user selection**: shopping list totals (ingredient → count), total recipe cost, total revenue/profit under chosen party context | **No** (compute client-side) | Depends on user’s choices and quantities; small, linear time over selected dishes. |
| **Edge/what-if**: excluding ingredients, substituting costs, filtering DLC                                                            | **Client-side**              | Fast enough with indices; depends on user toggles.                                 |

This split keeps payloads reasonable while giving you instant UX for user actions.

---

## **6) SvelteKit integration**

### **Prerender**

- In +layout.ts, mark export const prerender = true;.

- Load the **smallest** index (or import JSON statically) so pages can render instantly and hydrate.

```
// src/routes/+layout.ts
export const prerender = true;
```

### **Loading data**

You can **statically import** JSON to get tree-shaken chunks:

```
// src/lib/data/runtime.ts
import dishes from '$static/data/dishes.v1.json';
import ingredients from '$static/data/ingredients.v1.json';
import parties from '$static/data/parties.v1.json';
import indices from '$static/data/indices.v1.json';

export const Data = { dishes, ingredients, parties, indices };
```

(Or fetch('/data/...json') if you prefer, but static imports simplify.)

### **Stores & persistence**

```
// src/lib/stores/selection.ts
import { writable, derived } from 'svelte/store';

export const selectedDishes = // just use an array of dishId

// persist minimal state; cookies are <4KB, so store only changed selections
// you can also mirror to localStorage for resilience
```

**Shopping list derived store**:

```
// src/lib/stores/shopping.ts
import { derived } from 'svelte/store';
import { selectedDishes } from './selection';
import { Data } from '$lib/data/runtime';

export const shoppingList = derived(selectedDishes, ($sel) => {
  // Aggregate ingredient counts
  const totals = new Map<number, number>(); // ingredientId -> total count
  for (const [dishIdStr] of Object.entries($sel)) {
    const dishId = Number(dishIdStr);
    if (!qty) continue;
    const dish = Data.dishes.byId[dishId];  // if you emit a byId
    for (const line of dish.ingredients) {
      totals.set(line.ingredientId, (totals.get(line.ingredientId) ?? 0) + line.count);
    }
  }
  // Project into UI shape; optionally group by ingredient.source
  const items = Array.from(totals.entries()).map(([ingredientId, totalCount]) => {
    const ing = Data.ingredients.byId[ingredientId];
    return {
      ingredientId, name: ing.name, source: ing.source, totalCount,
      unitCost: ing.cost ?? 0, totalCost: (ing.cost ?? 0) * totalCount,
    };
  });
  // group by source if desired (for “where to get it” sections)
  return { items };
});
```

**Cookie persistence**: On app load, hydrate selectedDishes from a cookie (JSON). On changes, throttle and write back. (If you’re worried about cookie size, only store { dishId: qty } deltas and keep everything else recomputable.)

---

## **7) The build script (ETL) at a glance**

```
// scripts/build-data.ts
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import { z } from 'zod';
import { buildGraph } from '../src/lib/graph/build';
import { recipeCost, profitPerDishForParty, bestPartyForDish } from '../src/lib/calc/...';

function readCsv(path: string) {
  const raw = fs.readFileSync(path, 'utf8');
  return parse(raw, { columns: true, skip_empty_lines: true });
}

// 1) load CSVs and zod-parse into typed arrays
// 2) const graph = buildGraph(arrays);

// 3) for each dish:
//     - gather ingLines (count + unitCost)
//     - compute recipeCost
//     - for each party that maps to the dish:
//         compute partyPrice, revenue, profit
//     - compute bestParty & maxProfitPerDish
// 4) for each ingredient:
//     - bestDishForIngredient(ingredientId, graph)
//     - usedForParties (union parties of its dishes)

// 5) emit JSON files into /static/data with a version stamp.
```

**Why import calculators here?** So you never duplicate formulas. If you tweak a formula, both build artifacts and client views stay consistent.

---

## **8) UI: clean pages, clean selectors**

- **Dishes page**: list/sort by maxProfitPerDish, toggle a party view (shows profit if that party is active), checkbox to add quantity to selection (updates shopping list).

- **Ingredients page**: show bestDish & parties that ingredient participates in; from here add quantities of dishes that use it.

- **Parties page**: show dishes sorted by profit for that party (precomputed); quick “plan menu” adds quantities.

Keep page code thin by using:

- **Selectors** (tiny helpers that accept ids, return the precomputed record).

- **Derived stores** for anything selection-dependent.

---

## **9) Keeping calculations tidy over time**

- **One function = one responsibility** (e.g., recipeCost(), revenuePerDish(), profitPerDishForParty()).

- **No global state** in calculators; pass inputs explicitly.

- **Composition over branching**: small functions that feed each other.

- **Unit tests** for each function with small fixtures (a couple of dishes/ingredients/parties).

- **Document formulas** at the top of each file. Example:

```
partyPrice  = dish.final_price * party.bonus
revenue     = partyPrice * dish.servings
recipeCost  = Σ(count_i * ingredient_i.cost)
profit      = revenue - recipeCost
```

-

- **Version your data** (dishes.v1.json). If formulas change, bump to v2 and keep both side-by-side while you transition.

---

## **10) Notes & gotchas**

- **Missing costs**: treat as 0 or flag; expose a “data quality” panel.

- **Units (kg, max_meats)**: Only fold into calculations where explicitly needed; keep separate calculators (avoids hidden coupling).

- **Cookie size**: a cookie budget is small; persist only [] dishId, ]. If users make large plans, mirror to localStorage as well (progressive enhancement).

- **Performance**: Precomputations collapse n×m loops; runtime shopping list aggregation is linear in the number of selected dishes × ingredients per dish (typically tiny).

- **DLC / unlocks**: Filter in the UI by tags; the precomputed payload already contains those fields, so filtering is trivial.
