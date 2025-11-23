# Staff Page Implementation Plan - Clean Svelte 5 Architecture

## Executive Summary

This plan rebuilds the staff page using **strict unidirectional data flow** to eliminate the infinite loop bugs. The architecture uses URL as the single source of truth, with `$derived` for reactive filtering and no `$effect` synchronization loops.

## Root Cause Analysis

The current dishes/ingredients pages break due to **reactive cyclical dependencies**:

```
URL changes → $effect updates stores → derived recomputes
    ↑                                          ↓
updates URL ← component binds ← visible changes
```

**Key Problem**: Using `$effect` to synchronize between URL stores and domain stores creates infinite loops.

## Core Architecture Principles

### ✅ DO:

1. **URL is the single source of truth** for filters, sort, and search
2. Use `$derived` to compute filtered/sorted data from URL params
3. Update URL only via explicit user actions (event handlers with `goto`)
4. Apply MyBancho filters during derivation (not as store updates)
5. Keep all filtering/sorting logic in pure functions

### ❌ DON'T:

1. Create domain stores that sync from URL stores
2. Use `$effect` to watch derived state and update stores
3. Create bidirectional bindings between URL and component state
4. Update URL from inside `$effect` blocks
5. Use the old `EntityBundlePage` or `FiltersPanel` components

## Data Flow Architecture

```
User Action (click/type/select)
    ↓
Update URL directly (goto with new searchParams)
    ↓
SvelteKit updates $page.url
    ↓
$derived reads $page.url.searchParams + data.staffBundle
    ↓
Apply filters/sort/search (pure functions)
    ↓
Apply MyBancho filters (read LocalStore.value directly)
    ↓
Compute visible items + hidden count
    ↓
Render (no effects, no store updates)
```

## URL Schema Design

### URL Structure

```
/staff?q=kyoko&sort=wageMax&dir=desc&f.DLC=Base&f.Skill=Cleaning
```

### URL Parameters

- `q` - Search query string (debounced)
- `sort` - Sort field name (e.g., `name`, `wageMax`, `cookingMax`)
- `dir` - Sort direction (`asc` or `desc`)
- `f.DLC` - DLC filter (comma-separated IDs: `Base,Ichiban`)
- `f.Skill` - Skill filter (comma-separated: `Cleaning,Cooking`)

### Reading URL Params Pattern

```typescript
// In +page.svelte
let searchQuery = $derived($page.url.searchParams.get('q') ?? '');
let sortField = $derived($page.url.searchParams.get('sort') ?? 'name');
let sortDir = $derived($page.url.searchParams.get('dir') ?? 'asc');
let dlcFilters = $derived($page.url.searchParams.get('f.DLC')?.split(',').filter(Boolean) ?? []);
```

## Component Architecture

### 1. Page Component (`+page.svelte`)

**Responsibilities:**

- Read URL params via `$page.url.searchParams`
- Use `$derived` to compute filtered/sorted staff list
- Render staff cards and UI controls
- Handle user interactions with `goto` to update URL

**Key Sections:**

```svelte
<script>
  // 1. Read URL params (all $derived)
  let searchQuery = $derived(...);
  let sortField = $derived(...);
  let facetFilters = $derived(...);

  // 2. Compute filtered list (pure $derived)
  let filteredStaff = $derived.by(() => {
    let items = data.staff;

    // Apply search
    if (searchQuery) {
      items = filterBySearch(items, searchQuery);
    }

    // Apply facets
    items = applyFacetFilters(items, facetFilters);

    // Apply sort
    items = applySortOrder(items, sortField, sortDir);

    return items;
  });

  // 3. Apply MyBancho filters (read LocalStore.value)
  let visibleStaff = $derived.by(() => {
    return filteredStaff.filter(staff =>
      passesMyBanchoFilters(staff)
    );
  });

  let hiddenCount = $derived(filteredStaff.length - visibleStaff.length);

  // 4. Event handlers that update URL
  function updateSearch(query: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    goto(`?${params}`, { replaceState: true, noScroll: true });
  }
</script>
```

### 2. Filter Components

#### `SearchBox.svelte`

- Input with debounce (300ms)
- Calls parent callback with query string
- No internal state sync

#### `SortControls.svelte`

- Dropdown for sort field
- Button for direction toggle
- Calls parent callback with sort params

#### `FacetPanel.svelte`

- Collapsible panel with facet checkboxes
- Groups facets by category (DLC, Skill, etc.)
- Calls parent callback with selected facets
- Shows count of items per facet value

#### `MyBanchoPanel.svelte` (existing)

- Already works correctly (no URL sync)
- Uses LocalStore directly
- Triggers re-render via Svelte reactivity

### 3. Display Components

#### `StaffCard.svelte` (existing)

- Pure display component
- Takes staff object as prop

## Implementation Phases

### Phase 1: Foundation (Current → Basic URL Control) ✅

**Status**: Complete
**Features**:

- Basic rendering from `data.staff`
- Simple sort via URL params
- MyBancho panel integrated

### Phase 2: Search Implementation

**Goal**: Add search functionality with URL-driven filtering

**Tasks**:

1. Create `SearchBox.svelte` component
   - Input field with debounce (300ms)
   - Calls `updateSearch` callback

2. Add search derivation to `+page.svelte`

   ```typescript
   let searchQuery = $derived($page.url.searchParams.get('q') ?? '');

   let searchedStaff = $derived.by(() => {
   	if (!searchQuery) return data.staff;

   	return data.staff.filter((staff) =>
   		staff.search.toLowerCase().includes(searchQuery.toLowerCase())
   	);
   });
   ```

3. Add `updateSearch` handler
   ```typescript
   function updateSearch(query: string) {
   	const params = new URLSearchParams($page.url.searchParams);
   	if (query) {
   		params.set('q', query);
   	} else {
   		params.delete('q');
   	}
   	goto(`?${params}`, { replaceState: true, noScroll: true });
   }
   ```

**Testing**:

- Type in search box → URL updates
- Search query persists on reload
- No infinite loops when typing

### Phase 3: Facet Filters

**Goal**: Add facet checkboxes for DLC, Skills, etc.

**Tasks**:

1. Create `FacetPanel.svelte` component
   - Read available facets from `data.staffBundle.facets`
   - Render checkbox groups for each facet category
   - Show item counts per facet value
   - Call `updateFacets` callback

2. Add facet derivation to `+page.svelte`

   ```typescript
   let activeFacets = $derived.by(() => {
   	const facets: Record<string, string[]> = {};
   	for (const [key, value] of $page.url.searchParams) {
   		if (key.startsWith('f.')) {
   			facets[key.slice(2)] = value.split(',').filter(Boolean);
   		}
   	}
   	return facets;
   });

   let facetedStaff = $derived.by(() => {
   	let items = searchedStaff;

   	// Apply each active facet
   	for (const [category, values] of Object.entries(activeFacets)) {
   		if (values.length === 0) continue;

   		const facetIds = data.staffBundle.facets[category];
   		items = items.filter((staff) => {
   			return values.some((value) => facetIds[value]?.includes(staff.id));
   		});
   	}

   	return items;
   });
   ```

3. Add `updateFacets` handler

   ```typescript
   function updateFacets(category: string, values: string[]) {
   	const params = new URLSearchParams($page.url.searchParams);
   	const key = `f.${category}`;

   	if (values.length > 0) {
   		params.set(key, values.join(','));
   	} else {
   		params.delete(key);
   	}

   	goto(`?${params}`, { replaceState: true, noScroll: true });
   }
   ```

**Testing**:

- Click facet checkbox → URL updates
- Multiple facets work together (AND logic)
- Facet state persists on reload
- No loops when clicking checkboxes

### Phase 4: MyBancho Integration

**Goal**: Apply MyBancho filters without causing reactivity issues

**Tasks**:

1. Add MyBancho filtering to derivation chain

   ```typescript
   import { isDLCEnabled, getSelectedChapter } from '$lib/stores/myBancho.svelte';

   let visibleStaff = $derived.by(() => {
   	return facetedStaff.filter((staff) => {
   		// DLC filter
   		if (staff.dlc && !isDLCEnabled(staff.dlc)) {
   			return false;
   		}

   		// Chapter filter (if applicable)
   		const chapter = getSelectedChapter();
   		if (chapter.excludeStaffIds?.includes(staff.id)) {
   			return false;
   		}

   		return true;
   	});
   });

   let hiddenByMyBancho = $derived(facetedStaff.length - visibleStaff.length);
   ```

2. Show hidden count badge
   ```svelte
   {#if hiddenByMyBancho > 0}
   	<div class="text-sm opacity-60">
   		{hiddenByMyBancho} hidden by My Bancho settings
   	</div>
   {/if}
   ```

**Testing**:

- Change MyBancho DLC → list updates
- Change chapter → list updates
- No infinite loops
- Hidden count is accurate

### Phase 5: Sort Controls

**Goal**: Add UI controls for sorting

**Tasks**:

1. Create `SortControls.svelte` component
   - Dropdown for field selection
   - Button for direction toggle (↑/↓)
   - Show current sort state

2. Add sort derivation (using bundle pre-sorted indexes)

   ```typescript
   let sortField = $derived($page.url.searchParams.get('sort') ?? 'name');
   let sortDir = $derived($page.url.searchParams.get('dir') ?? 'asc');

   let sortedStaff = $derived.by(() => {
   	const sorted = data.staffBundle.sorted[sortField];
   	if (!sorted) return visibleStaff;

   	const order = sorted[sortDir];
   	if (!order) return visibleStaff;

   	// Use pre-computed sort order from bundle
   	return order
   		.map((id) => data.staffBundle.byId[id])
   		.filter((staff) => visibleStaff.includes(staff));
   });
   ```

3. Add `updateSort` handler
   ```typescript
   function updateSort(field: string, direction: 'asc' | 'desc') {
   	const params = new URLSearchParams($page.url.searchParams);
   	params.set('sort', field);
   	params.set('dir', direction);
   	goto(`?${params}`, { replaceState: true, noScroll: true });
   }
   ```

**Testing**:

- Click sort field → URL updates, list re-sorts
- Click direction → toggles asc/desc
- Sort persists on reload

### Phase 6: Polish & Optimization

**Goal**: Improve UX and performance

**Tasks**:

1. Add loading states
   - Show skeleton cards during navigation
   - Use `navigating` from `$app/state`

2. Add empty states
   - "No staff found" when filtered list is empty
   - Clear filters button

3. Add facet counts
   - Show "(5)" next to each facet option
   - Update counts as filters change

4. Optimize performance
   - Memoize expensive filters
   - Use `{#key}` blocks sparingly
   - Profile with Chrome DevTools

5. Add URL state helpers
   - "Copy link" button to share filtered view
   - "Clear all filters" button

**Testing**:

- Navigate between staff pages → smooth
- Complex filter combinations → fast
- Share URL → same view

### Phase 7: Apply to Other Pages

**Goal**: Use the same pattern for dishes and ingredients

**Tasks**:

1. Document the working pattern
   - Create reusable URL helpers
   - Extract common filter/sort logic

2. Refactor dishes page
   - Convert to URL-driven architecture
   - Remove EntityBundlePage
   - Test thoroughly

3. Refactor ingredients page
   - Same conversion
   - Reuse components where possible

## File Structure

```
src/routes/staff/
├── +page.svelte           # Main page (URL-driven)
├── +page.ts               # Load function (returns bundle)
├── StaffCard.svelte       # Display component
├── SearchBox.svelte       # Search input with debounce
├── SortControls.svelte    # Sort field/direction picker
└── FacetPanel.svelte      # Facet checkbox groups

src/lib/utils/
├── urlFilters.ts          # URL param helpers
├── staffFilters.ts        # Pure filter functions
└── staffSort.ts           # Pure sort functions

src/lib/components/
└── MyBanchoPanel.svelte   # Existing (no changes needed)
```

## Pure Function Library

### `staffFilters.ts`

```typescript
export function filterBySearch(items: Staff[], query: string): Staff[] {
	const lower = query.toLowerCase();
	return items.filter((item) => item.search.toLowerCase().includes(lower));
}

export function applyFacetFilter(
	items: Staff[],
	facet: Record<string, number[]>,
	category: string,
	values: string[]
): Staff[] {
	if (values.length === 0) return items;

	return items.filter((item) => values.some((value) => facet[value]?.includes(item.id)));
}

export function applyMyBanchoFilters(
	items: Staff[],
	enabledDLCs: Set<string>,
	excludedIds: Set<number>
): Staff[] {
	return items.filter((item) => {
		if (item.dlc && !enabledDLCs.has(item.dlc)) return false;
		if (excludedIds.has(item.id)) return false;
		return true;
	});
}
```

### `staffSort.ts`

```typescript
export function applySortOrder(
	items: Staff[],
	bundle: EntityBundle<Staff>,
	field: string,
	direction: 'asc' | 'desc'
): Staff[] {
	const sorted = bundle.sorted[field];
	if (!sorted) return items;

	const order = sorted[direction];
	if (!order) return items;

	// Use pre-computed sort order from bundle
	const itemsById = new Map(items.map((item) => [item.id, item]));
	return order.map((id) => itemsById.get(id)).filter((item): item is Staff => item !== undefined);
}
```

### `urlFilters.ts`

```typescript
export function parseSearchParam(url: URL, key: string, defaultValue = ''): string {
	return url.searchParams.get(key) ?? defaultValue;
}

export function parseMultiParam(url: URL, key: string): string[] {
	const value = url.searchParams.get(key);
	return value ? value.split(',').filter(Boolean) : [];
}

export function buildFilterURL(
	base: URL,
	updates: Record<string, string | string[] | null>
): string {
	const params = new URLSearchParams(base.searchParams);

	for (const [key, value] of Object.entries(updates)) {
		if (value === null || value === '') {
			params.delete(key);
		} else if (Array.isArray(value)) {
			params.set(key, value.join(','));
		} else {
			params.set(key, value);
		}
	}

	return `?${params}`;
}
```

## Type Definitions

```typescript
// URL filter state
export interface StaffFilters {
	search: string;
	sort: string;
	direction: 'asc' | 'desc';
	facets: Record<string, string[]>;
}

// Component props
export interface FacetPanelProps {
	facets: Record<string, Record<string, number[]>>;
	active: Record<string, string[]>;
	counts: Record<string, Record<string, number>>;
	onUpdate: (category: string, values: string[]) => void;
}

export interface SortControlsProps {
	field: string;
	direction: 'asc' | 'desc';
	fields: Array<{ value: string; label: string }>;
	onUpdate: (field: string, direction: 'asc' | 'desc') => void;
}
```

## Testing Strategy

### Unit Tests

- Pure filter functions with various inputs
- Pure sort functions with edge cases
- URL param parsing/building helpers

### Integration Tests

- Search → filters list correctly
- Facets → combines with AND logic
- MyBancho → hides items correctly
- Sort → uses bundle indexes

### E2E Tests (Playwright)

- Navigate to `/staff`
- Type in search → URL updates → list filters
- Click facet checkbox → URL updates → list filters
- Change sort → URL updates → list re-orders
- Reload page → same state restored
- Copy URL → paste in new tab → same view

### Performance Tests

- 100+ staff records → smooth filtering
- Complex facet combinations → no lag
- No memory leaks during repeated filtering

## Success Criteria

✅ **Functional Requirements:**

- [ ] Staff page has full facet/search/sort functionality
- [ ] URL fully represents page state (shareable links work)
- [ ] MyBancho filters work without causing reactivity issues
- [ ] Sorting uses pre-computed bundle indexes

✅ **Technical Requirements:**

- [ ] No infinite loops or browser freezing
- [ ] No `$effect` synchronization between stores
- [ ] All state derives from `$page.url.searchParams`
- [ ] Pure functions for filtering/sorting logic

✅ **User Experience:**

- [ ] Filtering is instant (<100ms)
- [ ] URL updates don't cause page jump/flash
- [ ] Empty states are clear and helpful
- [ ] Facet counts update correctly

✅ **Maintainability:**

- [ ] Pattern is clear enough to apply to dishes/ingredients pages
- [ ] Code is well-documented with examples
- [ ] Pure functions are easily testable
- [ ] Components are reusable across entity types

## Migration Path for Other Pages

Once staff page is working:

1. **Extract Reusable Utilities**
   - `EntityPageWrapper.svelte` (optional layout)
   - `urlFilters.ts` (shared helpers)
   - `FacetPanel.svelte` (generic version)

2. **Apply to Dishes Page**
   - Follow same URL schema
   - Use same derivation pattern
   - Reuse filter/sort components

3. **Apply to Ingredients Page**
   - Same process as dishes
   - Document any differences

4. **Remove Legacy Code**
   - Delete `EntityBundlePage.svelte`
   - Delete `FiltersPanel.svelte`
   - Update documentation

## Open Questions / Decisions

1. **Debounce Strategy**: Should search debounce before updating URL or after?
   - **Decision**: Before URL update (smooth UX, fewer history entries)

2. **Filter Combination Logic**: AND vs OR within facet categories?
   - **Decision**: OR within category (Base OR Ichiban), AND between categories

3. **Empty State**: When no results, show "clear filters" or "try different search"?
   - **Decision**: Both - clear button + helpful message

4. **URL History**: Use `replaceState` or `pushState` for filters?
   - **Decision**: `replaceState` for filters (cleaner history), `pushState` for navigation

5. **Mobile UI**: How to handle facet panel on small screens?
   - **Decision**: Collapsible drawer that slides in from side

## References

- [STAFF_REBUILD_PLAN.md](STAFF_REBUILD_PLAN.md) - Original problem statement
- [Svelte $state docs](https://svelte.dev/docs/svelte/$state)
- [Svelte $derived docs](https://svelte.dev/docs/svelte/$derived)
- [SvelteKit load functions](https://svelte.dev/docs/kit/load)
- [SvelteKit $app/state](https://svelte.dev/docs/kit/$app-state)
