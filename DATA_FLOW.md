# BanchoBox Data Flow Architecture

## Overview

This document describes the unidirectional data flow architecture of BanchoBox, ensuring clear understanding of how data moves through the application without circular dependencies.

## Data Flow Diagram

```
Server Data → Stores → Components → User Actions → Stores → URL
     ↓                                                        ↓
  Bundle                                                 History
 Initialization                                         (Read-only)
```

## 1. Server-Side Data Loading

**File:** `src/routes/+layout.server.ts`

### Process:
1. Server loads JSON bundles from static files
2. Large bundles (dishes, ingredients) are fetched via manifest URLs with content hashing
3. Small bundles (parties, staff, etc.) are directly imported
4. All data is returned as layout data

### Data Structure:
```typescript
{
  rows: T[];                              // Array of entities
  byId: Record<Id, T>;                    // Quick lookup map
  facets: Record<string, Record<string, Id[]>>; // Filter indexes
  sort: Record<string, string | number | null>;  // Sort values
}
```

**Key Point:** Server data is static and immutable. No data flows back to the server.

---

## 2. Client-Side Store Initialization

**File:** `src/routes/+layout.svelte`

### Process:
1. Layout receives data from server via `data` prop
2. `$effect.pre()` runs before DOM updates
3. All bundle stores are initialized with server data

```typescript
$effect.pre(() => {
  dishesBundleStore.set(data.dishes);
  ingredientsBundleStore.set(data.ingredients);
  // ... 6 more bundles
});
```

**Key Point:** This runs once on mount. Stores are now populated and reactive.

---

## 3. Store Architecture

### Entity Stores
Each entity type (dishes, ingredients, parties, staff) has a set of stores:

```typescript
{
  bundle: Writable<EntityBundle<T>>;                    // Raw data
  query: Writable<string>;                              // Search text
  sortKey: Writable<string>;                            // Sort field
  sortDir: Writable<'asc' | 'desc'>;                   // Sort direction
  filters: Writable<Record<string, Set<string>>>;      // User filters
  baselineFilters: Writable<Record<string, Set<string>>>; // Auto-filters
  visible: Readable<T[]>;                               // Derived: filtered results
}
```

### Persisted Stores
User preferences are persisted to localStorage:

```typescript
trackedDishIds: PersistedStore<Set<number>>    // Tracked dishes
hiredStaffIds: PersistedStore<Set<number>>     // Hired staff
selectedTierId: PersistedStore<Id | null>      // Cooksta tier
selectedChapterId: PersistedStore<Id | null>   // Story chapter
```

**Key Point:** Persisted stores implement the Svelte store contract directly (subscribe, get, set). No circular syncing between persisted state and stores.

---

## 4. Component Data Flow

### Page Components (e.g., `/dishes`, `/ingredients`)

```
EntityBundlePage → FiltersPanel
     ↓                  ↓
  Stores          URL Sync Setup
     ↓                  ↓
DishCard/etc.    User Interactions
```

### Unidirectional Flow:

1. **URL → Stores (ONE-TIME on mount)**
   - URL parameters are NOT automatically loaded into stores
   - Only exception: DLC filters sync to My Bancho on first load (if My Bancho is empty)
   - File: `FiltersPanel.svelte` lines 92-103

2. **Stores → Components (REACTIVE)**
   - Components subscribe to stores via `$store` syntax
   - Derived values update automatically
   - File: All `.svelte` components

3. **User Actions → Stores (EXPLICIT)**
   - User clicks filter → `filters.update()`
   - User changes sort → `sortKey.set()` / `sortDir.set()`
   - User types search → `query` bindable prop updates
   - File: `FiltersPanel.svelte`, `ResultsHeader.svelte`

4. **Stores → URL (AUTOMATIC)**
   - All store changes trigger URL sync
   - Uses `window.history.replaceState()` (no page reload)
   - File: `urlSync.ts`

**Key Point:** URL updates do NOT trigger store updates. This prevents circular loops.

---

## 5. Filtering & Sorting

### Filter Application (in order):

1. **Baseline Filters** (auto-applied)
   - DLC: Base + enabled DLCs from My Bancho
   - Chapter: Selected chapter from My Bancho
   - File: `FiltersPanel.svelte` lines 33-81

2. **User Filters** (explicit selections)
   - Applied on top of baseline
   - Persisted to URL
   - File: `FiltersPanel.svelte`

3. **Search Query** (substring match)
   - Filters by entity's `.search` field
   - Debounced 300ms
   - File: `FiltersPanel.svelte` lines 123-139

4. **Sorting** (final step)
   - Uses entity's `.sort[key]` field
   - Stable sort with tie-breaker
   - File: `entityBundle.ts` lines 49-108

### Result:
```typescript
const visible = $derived(() => {
  // Apply filters + search + sort
  return filteredAndSortedRows;
});
```

**Key Point:** Filtering is purely derived. No side effects. Results update automatically when inputs change.

---

## 6. Tracking & Persistence

### Tracking Dishes:

```
User clicks track → trackedDishIds.track(id) → Store updates → localStorage
                                                     ↓
                                              Components re-render
```

### Implementation:
- `DishCard.svelte` and `PartyDishCard.svelte` read from store (one-way)
- Write happens only through explicit user action via `onTrackChange` handler
- No circular effects between local state and store

**Key Point:** Effects only read from store. Writes happen through event handlers.

---

## 7. URL Synchronization

**File:** `src/lib/stores/urlSync.ts`

### Format:
```
/dishes?dishes.q=tuna&dishes.sortKey=profit&dishes.f.DLC=Base,DLC1
        └─────────┬────────────────┬─────────────┬──────────────┘
              namespace        query        sort        filters
```

### Process:
```typescript
syncToUrl(urlKey, stores) {
  // Subscribe to all stores
  stores.query.subscribe(update);
  stores.sortKey.subscribe(update);
  stores.sortDir.subscribe(update);
  stores.filters.subscribe(update);

  // On any change:
  function update() {
    const params = buildFromStores();
    window.history.replaceState(null, '', url + params);
  }
}
```

**Key Point:** URL is a write-only destination. Changes to URL do not trigger store updates.

---

## 8. Common Patterns to Avoid

### ❌ DON'T: Circular Store Sync
```typescript
// BAD - Creates infinite loop
$effect(() => {
  store.set(persistedState.get());  // Read from A, write to B
});
store.subscribe((value) => {
  persistedState.set(value);         // Read from B, write to A
});
```

### ✅ DO: Direct Store Implementation
```typescript
// GOOD - Persisted store implements store contract directly
const store = persistedLocalState('key', initialValue);
store.subscribe(callback);  // Direct subscription
store.set(newValue);        // Direct update
```

### ❌ DON'T: Two-Way Effects
```typescript
// BAD - Effect both reads and writes to store
$effect(() => {
  if (localState) store.update(x => x);
});
```

### ✅ DO: One-Way Effects + Event Handlers
```typescript
// GOOD - Effect only reads, handler only writes
$effect(() => {
  localState = $store.has(id);  // Read
});
function onClick() {
  store.toggle(id);  // Write (explicit user action)
}
```

---

## 9. Effect Dependencies

### Safe Dependencies:
- Derived states (`$derived`)
- Store values (`$store`)
- Props
- Local state (with guards)

### Guards to Prevent Loops:
```typescript
$effect(() => {
  if (!initialized) {
    initialized = true;
    return;  // Skip first run
  }
  // ... rest of effect
});
```

### Conditional Effects:
```typescript
$effect(() => {
  if (!condition) return;  // Early return is OK if condition is stable
  // ... effect body
});
```

**Key Point:** Early returns are safe when the condition is based on derived state or stable values.

---

## 10. Summary: Data Flow Rules

1. **Server → Client**: One-time initialization on mount
2. **Stores → Components**: Reactive subscriptions (read-only in components)
3. **User → Stores**: Explicit updates via event handlers
4. **Stores → URL**: Automatic sync (write-only)
5. **URL → Stores**: NO automatic sync (prevents loops)
6. **Effects**: Read-only, no side effects that write to dependencies
7. **Persistence**: Stores implement contract directly, no wrapper needed

### The Golden Rule:
**Data flows in one direction. Never create cycles where A updates B and B updates A.**

---

## Debugging Tips

### If you see infinite loops:
1. Check for circular `$effect` dependencies
2. Look for store subscriptions that write back to stores
3. Verify effects have proper initialization guards
4. Ensure URL sync is one-way only

### If stores aren't updating:
1. Verify bundle initialization in `+layout.svelte`
2. Check that components subscribe with `$store` syntax
3. Ensure derived stores are properly chained

### If persistence isn't working:
1. Check localStorage in browser DevTools
2. Verify persisted store implements subscribe/get/set
3. Ensure no circular sync between persisted and non-persisted stores
