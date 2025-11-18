# BanchoBox - Dave the Diver Companion App

## Overview

BanchoBox is a SvelteKit-based companion application for the game **Dave the Diver**. It helps players manage their in-game sushi restaurant (Bancho's Sushi Bar) by providing tools for menu planning, ingredient tracking, profitability analysis, and party event optimization.

The app processes game data from CSV files into optimized JSON bundles, allowing players to:

- Browse a complete dish database with unlock conditions, pricing, and party bonuses
- Track ingredients with sources and gathering information
- Plan menus based on profitability and party events
- Manage staff assignments based on Cooksta tier
- Monitor restaurant progression and advancement requirements
- Filter content by DLC ownership and story chapter progression

Visit the live application at: **[banchobox.com](https://banchobox.com)**

## Additional Documentation

- **[DATA_FLOW.md](DATA_FLOW.md)** - Comprehensive guide to the unidirectional data flow architecture, store patterns, and avoiding circular dependencies
- **[SVELTEKIT_BEST_PRACTICES.md](SVELTEKIT_BEST_PRACTICES.md)** - Best practices for Svelte 5 (runes) and SvelteKit 2 development
- **[README.md](README.md)** - User-facing project overview and quick start guide

## Tech Stack

### Core Framework
- **SvelteKit** - Full-stack framework (using Svelte 5 with runes)
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server

### UI & Styling
- **Skeleton** (`@skeletonlabs/skeleton-svelte`) - Design system and UI components
- **Lucide Icons** (`@lucide/svelte`) - Icon library
- **TailwindCSS** - Utility-first CSS framework
- **bits-ui** - Headless UI component primitives

### Data & State Management
- **Svelte 5 Reactivity** - Built-in state management with `$state`, `$derived`, and `$effect`
- **Zod** - Schema validation for CSV data parsing
- **csv-parse** - CSV data processing

### Development Tools
- **Bun** - Package manager and runtime (see below)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Vitest** - Unit testing
- **Playwright** - E2E testing

### Deployment
- **Cloudflare Pages** - Hosting platform (using `@sveltejs/adapter-cloudflare`)

## Package Manager

This project supports both **npm** and **bun** as package managers. The scripts in `package.json` use `npm run` internally, but both package managers work seamlessly.

### Using npm (default):

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### Using bun (alternative):

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build

# Run tests
bun run test
```

**Note**: Both `bun.lock` and `package-lock.json` are maintained in the repository for compatibility.

## Project Structure

```
banchobox/
├── .github/                 # GitHub Actions and CI/CD
├── .husky/                  # Git hooks for pre-commit linting
├── data/                    # CSV source data files
│   ├── branch-data.csv
│   ├── chapters-data.csv
│   ├── cooksta-data.csv
│   ├── dish-ingredients-data.csv
│   ├── dish_levels/        # Individual dish level data files
│   ├── dishes-data.csv
│   ├── dlc-data.csv
│   ├── ingredients-data.csv
│   ├── parties-data.csv
│   ├── party-dishes-data.csv
│   ├── staff-data.csv
│   └── suit-data.csv
├── e2e/                     # Playwright end-to-end tests
├── scripts/
│   └── build-database.ts   # CSV to JSON data processing
├── src/
│   ├── lib/
│   │   ├── data/           # Generated JSON bundles (gitignored)
│   │   ├── stores/         # Svelte stores for state management
│   │   │   ├── chapters.ts
│   │   │   ├── cooksta.ts
│   │   │   ├── dishLevels.ts
│   │   │   ├── dishes.ts
│   │   │   ├── dlc.ts
│   │   │   ├── entityBundle.ts
│   │   │   ├── hiredStaff.ts
│   │   │   ├── ingredients.ts
│   │   │   ├── parties.ts
│   │   │   ├── partyDishes.ts
│   │   │   ├── staff.ts
│   │   │   ├── tracking.ts
│   │   │   └── urlSync.ts
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── AnchorHandler.svelte
│   │   │   ├── EntityBundlePage.svelte
│   │   │   ├── FiltersPanel.svelte
│   │   │   ├── HiddenItemsIndicator.svelte
│   │   │   ├── HiredStaffSidebar.svelte
│   │   │   ├── PixelIcon.svelte
│   │   │   ├── ResponsiveLayout.svelte
│   │   │   ├── ResultsHeader.svelte
│   │   │   └── SortControl.svelte
│   │   ├── images/         # Static images and game assets
│   │   └── types.ts        # TypeScript type definitions
│   ├── routes/
│   │   ├── +layout.server.ts  # Server-side data loading
│   │   ├── +layout.svelte     # Root layout with store initialization
│   │   ├── +page.svelte       # Home page
│   │   ├── about/             # About page
│   │   ├── dishes/            # Dish database pages
│   │   ├── ingredients/       # Ingredient catalog pages
│   │   ├── parties/           # Party events pages
│   │   ├── staff/             # Staff management pages
│   │   └── tracking/          # Dish tracking pages
│   └── app.html            # HTML template
├── static/                  # Static assets (images, favicon)
├── CLAUDE.md               # This file - AI assistant instructions
├── DATA_FLOW.md            # Architecture documentation
├── README.md               # User-facing documentation
├── SVELTEKIT_BEST_PRACTICES.md  # Development guidelines
└── package.json            # Dependencies and scripts
```

## Data Processing

The app uses a build-time data processing pipeline:

1. CSV files in `data/` directory contain game data (dishes, ingredients, parties, staff, etc.)
2. `scripts/build-database.ts` processes CSVs with Zod schema validation
3. Optimized JSON bundles are generated in `src/lib/data/` (gitignored)
4. The `build:data` script runs automatically before `dev` and `build`

```bash
# Manually rebuild data bundles
npm run build:data
```

The data bundles use an optimized structure with:
- `rows[]`: Array of all entities
- `byId{}`: Quick lookup map by ID
- `facets{}`: Pre-computed filter indexes for efficient filtering
- `sort{}`: Sort values for each sortable field

See [DATA_FLOW.md](DATA_FLOW.md) for detailed architecture information.

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start dev server (builds data automatically)
npm run dev

# Start dev server and open browser
npm run dev -- --open
```

### Code Quality

```bash
# Run type checking
npm run check

# Run type checking in watch mode
npm run check:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test
```

### Pre-commit Hooks

The project uses Husky and lint-staged to run linting and formatting automatically before commits:
- ESLint fixes applied automatically
- Prettier formatting applied automatically
- Configured via `.husky/` directory and `lint-staged` in `package.json`

## Key Features

### State Management

The app uses a comprehensive store architecture built on Svelte 5 runes. All stores are located in `src/lib/stores/`:

#### Entity Bundle Stores
Each major entity type has a set of stores for managing data, filtering, sorting, and search:
- **Dishes Store** (`dishes.ts`) - Complete dish database with profitability calculations
- **Ingredients Store** (`ingredients.ts`) - Ingredient catalog with sources and gathering info
- **Parties Store** (`parties.ts`) - Party event data with bonus multipliers
- **Staff Store** (`staff.ts`) - Staff member database with skills and requirements
- **Party Dishes Store** (`partyDishes.ts`) - Relationship between parties and their featured dishes
- **Dish Levels Store** (`dishLevels.ts`) - Individual dish progression and upgrade data

#### Progression & Tracking Stores
- **Cooksta Store** (`cooksta.ts`) - Tracks selected restaurant tier and capabilities
- **Chapters Store** (`chapters.ts`) - Manages story chapter progression for content filtering
- **DLC Store** (`dlc.ts`) - Tracks owned DLC for content availability
- **Hired Staff Store** (`hiredStaff.ts`) - Persists user's hired staff selections
- **Tracking Store** (`tracking.ts`) - Persists user's tracked/favorite dishes

#### Utility Stores
- **Entity Bundle Store** (`entityBundle.ts`) - Generic store factory for entity data management
- **URL Sync Store** (`urlSync.ts`) - Bidirectional URL synchronization for filters, search, and sorting

Each entity bundle store provides:
```typescript
{
  bundle: Writable<EntityBundle<T>>;      // Raw data from server
  query: Writable<string>;                // Search text
  sortKey: Writable<string>;              // Current sort field
  sortDir: Writable<'asc' | 'desc'>;     // Sort direction
  filters: Writable<Record<string, Set<string>>>; // User-selected filters
  baselineFilters: Writable<Record<string, Set<string>>>; // Auto-applied filters
  visible: Readable<T[]>;                 // Computed filtered/sorted results
}
```

### Data Flow Architecture

The app follows a strict unidirectional data flow pattern:

1. **Server → Client**: Data loaded once via `+layout.server.ts`
2. **Stores → Components**: Reactive subscriptions (read-only)
3. **User Actions → Stores**: Explicit updates via event handlers
4. **Stores → URL**: Automatic synchronization (write-only)

**Critical Pattern**: URL changes do NOT trigger store updates. This prevents circular loops and maintains predictable state management.

See [DATA_FLOW.md](DATA_FLOW.md) for comprehensive architecture documentation.

### Persistent Storage

User preferences and tracking data are persisted to localStorage:
- Selected Cooksta tier
- Selected story chapter
- Owned DLC
- Hired staff selections
- Tracked/favorite dishes

The persistence layer implements the Svelte store contract directly (subscribe/get/set) to avoid circular dependencies.

### Filtering & Search

Sophisticated multi-level filtering system:
1. **Baseline Filters**: Auto-applied based on DLC ownership and chapter progression
2. **User Filters**: Explicit faceted filtering (e.g., by dish type, rarity, branch)
3. **Search**: Substring search across entity names and metadata
4. **Sorting**: Stable sorting with configurable fields and directions

All filtering is purely derived with no side effects, ensuring predictable performance.

### URL State Management

Filter, search, and sort state is synchronized to the URL for shareability:
```
/dishes?dishes.q=tuna&dishes.sortKey=profit&dishes.f.DLC=Base,DLC1
```

This enables:
- Shareable filtered views
- Browser back/forward navigation
- Bookmarkable searches
- Deep linking to specific configurations

### Responsive Design

Built with Skeleton's responsive components and TailwindCSS utilities for mobile-first design:
- Adaptive layouts with `ResponsiveLayout.svelte`
- Mobile-optimized filter panels
- Touch-friendly UI controls
- Optimized for all screen sizes

## Deployment

The app is configured for Cloudflare Pages deployment using `@sveltejs/adapter-cloudflare`.

### Building for Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build process:
1. Runs `build:data` to generate JSON bundles from CSV sources
2. Compiles TypeScript and Svelte components
3. Optimizes assets for Cloudflare's edge network
4. Outputs to `.svelte-kit/cloudflare/` directory

### Cloudflare Configuration

The project includes `wrangler.jsonc` for Cloudflare Workers/Pages configuration. The adapter optimizes for:
- Edge network distribution
- Fast cold starts
- Minimal bundle size
- Static asset caching

### Static Assets

Static files in the `static/` directory are served directly:
- Favicon and app icons
- Game images and assets
- Other static resources

### Performance Optimizations

- Prerendering enabled where possible
- Code splitting for optimal loading
- Content hashing for long-term caching
- Minimal JavaScript for static pages

## Development Guidelines

### Architecture Principles

1. **Unidirectional Data Flow**: Always maintain one-way data flow to prevent circular dependencies
2. **Effects Are Read-Only**: Use `$effect` only for reading state, never for synchronizing state
3. **Explicit Updates**: All state changes should be explicit via event handlers, not implicit via effects
4. **URL as Write-Only**: URL changes do not trigger store updates - only user actions update stores
5. **No Top-Level Effects**: Effects must be created inside component context, not at module level

### Common Patterns

#### ✅ DO: Event Handlers for State Updates
```typescript
function onFilterChange(facet: string, value: string) {
  filters.update(f => {
    // Explicit state update from user action
    f[facet].add(value);
    return f;
  });
}
```

#### ❌ DON'T: Use Effects for State Synchronization
```typescript
// BAD - Creates circular dependency
$effect(() => {
  store.set(otherStore.get());
});
```

#### ✅ DO: Implement Store Contract Directly for Persistence
```typescript
// GOOD - Direct store implementation
const store = persistedLocalState('key', initialValue);
```

#### ❌ DON'T: Create Two-Way Effect Bindings
```typescript
// BAD - Effect both reads and writes
$effect(() => {
  if (localState) store.update(x => x);
});
```

### Testing

- Unit tests use Vitest with `@vitest/browser` for component testing
- E2E tests use Playwright for full user flow testing
- Tests should be written for critical user paths and complex logic
- Store logic should be unit tested independently of components

### Code Style

- Use Prettier for consistent formatting (configured in `.prettierrc`)
- Follow ESLint rules (configured in `eslint.config.js`)
- Use TypeScript strict mode for type safety
- Prefer functional composition over class inheritance
- Keep components small and focused on single responsibilities

### Adding New Features

When adding new entity types or features:

1. **Create CSV Data**: Add source data file to `data/` directory
2. **Update Build Script**: Modify `scripts/build-database.ts` to process new data
3. **Define Types**: Add TypeScript types to `src/lib/types.ts`
4. **Create Store**: Use `entityBundle.ts` factory for consistent store structure
5. **Create Route**: Add page under `src/routes/` with `+page.svelte`
6. **Add UI Components**: Reuse existing components from `src/lib/ui/` where possible
7. **Update Documentation**: Keep CLAUDE.md and DATA_FLOW.md current

## Disclaimer

BanchoBox is a fan-made companion tool for Dave the Diver. It is not affiliated with the game's developers or publishers. All game assets are used for informational purposes under fair use guidelines.
