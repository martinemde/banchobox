# Bancho Box - Dave the Diver Database

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

**Prerequisites and Setup:**

- Ensure Node.js is installed (project uses Node.js with bun)
- Clone the repository and navigate to the project root

**Building and Running the Application:**

- `bun install` -- Install all dependencies (takes 60-90 seconds). NEVER CANCEL.
- `bun run build:data` -- Build the CSV data into JSON bundles (takes <1 second). NEVER CANCEL.
- `bun run dev` -- Start development server (automatically runs build:data first, takes 2-5 seconds). Server runs in background, exit with Ctrl+C.
- `bun run dev -- --open` -- Start development server and open in browser. Server runs in background, exit with Ctrl+C.
- `bun run build` -- Create production build (takes 25-30 seconds). NEVER CANCEL. Set timeout to 60+ minutes. NOTE: Currently fails due to broken internal link.
- `bun run preview` -- Preview production build locally. Server runs in background, exit with Ctrl+C.

**Testing:**

- `bun run test:e2e` -- Run Playwright end-to-end tests (takes 30-60 seconds when working). NEVER CANCEL. Set timeout to 90+ minutes.
  - NOTE: Currently fails due to broken internal link (#staff-Hamako)
  - Requires Playwright browsers: run `bunx playwright install` first
- `bun run test:unit` -- Run Vitest unit tests (requires Playwright browsers installed)
- `bun run test` -- BROKEN: References missing script. Use `bun run test:e2e` instead.
- Tests validate all main pages render correctly with expected content

**Code Quality:**

- `bun run lint` -- Run ESLint (takes 15-30 seconds)
- `bun run format` -- Run Prettier to format code (takes 5-10 seconds)
- ALWAYS run `bun run lint` and `bun run format` before committing changes to maintain code quality

## Validation Scenarios

**CRITICAL**: Always test these complete end-to-end scenarios after making changes:

**Core Application Functionality:**

1. Run `bun run dev` and verify the application starts on http://localhost:5173
2. Navigate to each main section and verify content loads:
   - **Home page**: Displays welcome content and navigation ✅ VERIFIED WORKING
   - **Dishes page**: Shows recipe database with filtering, search, and pricing information ✅ VERIFIED WORKING
   - **Ingredients page**: Displays ingredient database with costs, sources, and usage counts ✅ VERIFIED WORKING
   - **Parties page**: Shows party events with dish lists, bonuses, and profit calculations ✅ VERIFIED WORKING
   - **Tracking page**: Provides ingredient tracking for selected dishes ✅ VERIFIED WORKING

**Data Validation:**

- Verify that `bun run build:data` successfully processes CSV files from `data/` directory
- Check that generated JSON files appear in `src/lib/data/`
- Confirm dish data includes pricing, ingredients, party associations, and unlock conditions
- Validate ingredient data shows sources, costs, and recipe usage

**Search and Filtering:**

- Test search functionality works across dishes and ingredients ✅ VERIFIED WORKING
- Verify filtering by categories, unlock conditions, and other criteria ✅ VERIFIED WORKING
- Confirm party-specific dish filtering and bonus calculations ✅ VERIFIED WORKING

**Browser Testing Validation (Completed):**

All major user flows have been validated manually in browser:

- ✅ Navigation between all main sections works correctly
- ✅ Search and filtering functionality operational
- ✅ Dish cards display pricing and ingredient information
- ✅ Ingredient cards show sources, costs, and recipe usage
- ✅ Party listings display correctly with proper sorting
- ✅ Tracking interface loads and functions as expected
- ✅ Application responsive design works across different viewports

## Important Files and Structure

**Data Processing:**

- `data/` -- CSV source files (dishes.csv, ingredients.csv, parties.csv, etc.)
- `scripts/build-database.ts` -- Main data processing script
- `scripts/build/` -- Data processing modules (load.ts, enrich.ts, export.ts)
- `src/lib/data/` -- Generated JSON data files (dishes.v1.json, ingredients.v1.json, etc.)

**Application Code:**

- `src/routes/` -- SvelteKit pages and components
- `src/lib/` -- Shared utilities and data types
- `src/lib/types.js` -- TypeScript definitions for data structures

**Configuration:**

- `package.json` -- Project dependencies and bun scripts
- `svelte.config.js` -- SvelteKit configuration
- `eslint.config.js` -- ESLint configuration
- `playwright.config.ts` -- End-to-end test configuration

**Testing:**

- `e2e/` -- Playwright end-to-end tests
- `e2e/pages.test.ts` -- Main page validation tests

## Technology Stack Details

- **Framework**: SvelteKit with TypeScript
- **UI Library**: Skeleton UI components
- **Data Processing**: Custom TypeScript scripts with Zod validation
- **Testing**: Playwright for end-to-end testing
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## Data Model Overview

**Dishes**: Complete recipe information including ingredients, pricing, servings, unlock conditions, and party associations
**Ingredients**: Source data, pricing, sell values, locations, and usage in recipes
**Parties**: Event information with associated dishes, bonus multipliers, and profit calculations
**Relationships**: Many-to-many relationships between dishes/ingredients and dishes/parties

## Build Pipeline

1. CSV data in `data/` directory is processed by `scripts/build-database.ts`
2. Data is loaded, validated, and enriched with calculated fields
3. Final JSON bundles are exported to `src/lib/data/` with version prefixes
4. SvelteKit builds the application using the generated JSON data
5. Tests validate the complete application functionality

## Common Commands Reference

**Development Workflow:**

```bash
bun install                     # Install dependencies (60-90 seconds)
bun run dev                     # Start development with auto-rebuild (2-5 seconds)
bun run build:data             # Rebuild data only (<1 second)
bun run lint && bun run format  # Code quality checks (20-40 seconds total)
bun run test:e2e               # Run tests (currently broken due to #staff-Hamako link)
bun run build                  # Production build (currently fails due to broken link)
```

**Debugging Data Issues:**

- Check CSV files in `data/` directory for format issues
- Review console output from `bun run build:data` for validation errors
- Verify generated JSON files in `src/lib/data/` contain expected data
- Run TypeScript compiler to catch type issues

## Known Issues

**CRITICAL ISSUES TO BE AWARE OF:**

1. **Broken Internal Link**: There's a broken link to `#staff-Hamako` that causes:
   - Production builds (`bun run build`) to fail during prerendering
   - End-to-end tests (`bun run test:e2e`) to fail
   - This does NOT affect development server or manual testing

2. **Test Script Issues**:
   - `bun run test` references missing `test:integration` script - use `bun run test:e2e` instead
   - Unit tests require Playwright browsers: run `bunx playwright install` first

3. **Application Functionality**: Despite build/test issues, all core functionality works perfectly in development mode

## Performance Notes

- Data processing is optimized to produce the best runtime performance
- JSON bundles include pre-computed search indexes and sort keys
- Application uses client-side filtering and search for responsiveness
- Production builds include optimized asset bundling and minification
