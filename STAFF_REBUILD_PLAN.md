# Staff Page Incremental Rebuild Plan

## Problem Statement

The dishes and ingredients pages are **broken with infinite loop bugs** caused by cyclic reactivity in `EntityBundlePage` and `FiltersPanel`. The staff page was rebuilt from scratch with basic functionality to avoid these bugs, and now we need to incrementally add back the missing features (facets, search, filters) **without reintroducing the infinite loops**.

## Root Cause of Original Bug

The bug is caused by **multiple layers of reactive indirection** creating infinite loops:

### Layer 1: EntityBundlePage Store Sync
```svelte
// EntityBundlePage.svelte:68-84
$effect(() => {
    domainQuery.set($urlQuery);      // URL → domain stores
    // ... more store updates
});
```

**Problem:** The `$effect` creates an endless sync loop because:
- It updates domain stores → triggers `derived` recomputation (entityBundle.ts:183-195)
- The `derived` recomputes `visible` → components re-render
- Re-render might cause the `$effect` to run again (even with guards)

### Layer 2: FiltersPanel Effects
```svelte
// FiltersPanel.svelte:35-53, 56-71
$effect(() => {
    // Reads: allDLCs, isDLCEnabled (reactive LocalStore)
    baselineFilters.update(...);  // Updates store
});
```

**Problem:**
- Reads from `enabledDLCIdsStore.value` (reactive)
- Updates `baselineFilters` writable store
- `baselineFilters` feeds into `visible` derived computation
- `visible` changes → component re-renders → FiltersPanel updates
- This can trigger the `$effect` again

### Layer 3: Double Store System (The Real Killer)

The architecture has **two parallel store systems**:
1. **URL stores** (`urlParamStore`, `urlFiltersStore`) - derived from `$page.url`
2. **Domain stores** (from `createEntityStores`) - writable stores

The sync between them creates the infinite loop:
```
URL stores change → $effect runs → domain stores update
  ↓                                       ↓
$page.url changes ←  goto() called ← component binds to URL stores
  ↑                                       ↑
derived recomputes ← visible changes ← domain stores feed derived
```

### Symptoms
- **Page completely unresponsive after first load**
- Browser freezes/hangs (tight reactive loop)
- CPU maxes out
- No user interaction possible

### Why Guards Don't Help

Attempted fixes that didn't work:
- ❌ Checking `if (query !== lastQuery)` - still creates state updates inside $effect
- ❌ Using `untrack()` + `get()` - doesn't prevent the effect from running
- ❌ Reference equality checks - the stores still update and trigger derivations

**The fundamental problem:** You cannot safely sync two reactive systems with `$effect`

## Correct Architecture

**Strictly unidirectional flow:**

```
User Action (click, type, select)
    ↓
Update URL directly (goto with new searchParams)
    ↓
SvelteKit updates $page.url store
    ↓
$derived reads $page.url.searchParams + data.staffBundle
    ↓
Compute filtered/sorted staff list
    ↓
Render (no effects, no store updates)
```

**Key principles:**
- ✅ Use `$derived` to compute state from URL params (not stores with `$effect`)
- ✅ Update URL only via explicit user actions (event handlers)
- ✅ Never use `$effect` to sync between stores
- ✅ MyBancho filters apply client-side during derivation (not as store updates)
- ❌ No `EntityBundlePage` (it's the source of the bug)
- ❌ No domain stores synced from URL stores
- ❌ No `$effect` watching derived state

## Incremental Build Plan

### Phase 1: Basic URL-Driven Rendering ✅ (Current State)

**Status:** Working in [src/routes/staff/+page.svelte](src/routes/staff/+page.svelte)
- URL params control sort: `?sort=wageMax&dir=desc`
- Simple `$effect` + `goto()` for sort changes
- Basic rendering with MyBancho panel
- **No facets, no search yet**

### Phase 2: Add Search (Next)

Add search box that updates URL:
1. Create search input component
2. Debounce input changes (300ms)
3. On debounce trigger: `goto()` with `?q=...` param
4. Derive filtered staff: `$derived(() => filterByQuery($page.url.searchParams.get('q'), staffList))`
5. Render filtered list

**Testing:** Verify no infinite loops when typing in search box

### Phase 3: Add Facet Filters

Add facet checkboxes for DLC, skills, etc:
1. Read available facets from `data.staffBundle.facets`
2. Create checkbox list for each facet
3. On checkbox change: `goto()` with `?staff.f.DLC=Base,Premium` params
4. Derive filtered staff: `$derived(() => filterByFacets($page.url.searchParams, staffList))`
5. Render filtered list

**Testing:** Verify no loops when clicking checkboxes

### Phase 4: Integrate MyBancho Filters

Apply MyBancho DLC/Chapter filtering:
1. Read MyBancho state: `enabledDLCIdsStore.value`, `selectedChapterIdStore.value`
2. Apply as **additional filter** during derivation (not separate store)
3. Compute `visibleWithoutMyBancho` to show "{num} hidden" count
4. Keep MyBancho state changes from triggering URL updates

**Testing:** Verify changing MyBancho settings doesn't cause loops

### Phase 5: Refactor to Reusable Pattern

Once staff page works perfectly:
1. Document the working pattern
2. Extract reusable utilities (if any)
3. Apply same pattern to fix dishes page
4. Apply same pattern to fix ingredients page

## Implementation Guidelines

### DO:
- ✅ Read URL params via `$page.url.searchParams` from SvelteKit
- ✅ Use `$derived` for all computed state
- ✅ Update URL via explicit `goto()` calls in event handlers
- ✅ Keep all filtering logic in pure functions
- ✅ Test each phase thoroughly before moving to next

### DON'T:
- ❌ Create domain stores that sync from URL stores
- ❌ Use `$effect` to watch derived state and update stores
- ❌ Use `EntityBundlePage` or `FiltersPanel` components
- ❌ Create bidirectional bindings between URL and component state
- ❌ Update URL from `$effect` blocks

## Success Criteria

- Staff page has full facet/search/sort functionality
- No infinite loops or browser freezing
- URL fully represents page state (shareable links work)
- MyBancho filters work without causing reactivity issues
- Pattern is clear enough to apply to dishes/ingredients pages
