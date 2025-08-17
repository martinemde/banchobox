# Bancho Box - Dave the Diver Database

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

**Prerequisites and Setup:**
- Ensure Node.js is installed (project uses Node.js with npm)
- Clone the repository and navigate to the project root

**Building and Running the Application:**
- `npm install` -- Install all dependencies (takes 30-60 seconds)
- `npm run build:data` -- Build the CSV data into JSON bundles (takes 5-10 seconds). NEVER CANCEL.
- `npm run dev` -- Start development server (automatically runs build:data first, takes 10-15 seconds)
- `npm run dev -- --open` -- Start development server and open in browser
- `npm run build` -- Create production build (takes 30-45 seconds). NEVER CANCEL. Set timeout to 60+ minutes.
- `npm run preview` -- Preview production build locally

**Testing:**
- `npm run test` -- Run Playwright end-to-end tests (takes 30-60 seconds). NEVER CANCEL. Set timeout to 90+ minutes.
- Tests validate all main pages render correctly with expected content

**Code Quality:**
- `npm run lint` -- Run ESLint (takes 5-10 seconds)
- `npm run format` -- Run Prettier to format code (takes 5-10 seconds) 
- ALWAYS run `npm run lint` and `npm run format` before committing changes or the CI (.github/workflows/build.yml) will fail

## Validation Scenarios

**CRITICAL**: Always test these complete end-to-end scenarios after making changes:

**Core Application Functionality:**
1. Run `npm run dev` and verify the application starts on http://localhost:5173
2. Navigate to each main section and verify content loads:
   - **Home page**: Displays welcome content and navigation
   - **Dishes page**: Shows recipe database with filtering, search, and pricing information
   - **Ingredients page**: Displays ingredient database with costs, sources, and usage counts
   - **Parties page**: Shows party events with dish lists, bonuses, and profit calculations
   - **Tracking page**: Provides ingredient tracking for selected dishes

**Data Validation:**
- Verify that `npm run build:data` successfully processes CSV files from `data/` directory
- Check that generated JSON files appear in `src/lib/data/` with v1 versioning
- Confirm dish data includes pricing, ingredients, party associations, and unlock conditions
- Validate ingredient data shows sources, costs, and recipe usage

**Search and Filtering:**
- Test search functionality works across dishes and ingredients
- Verify filtering by categories, unlock conditions, and other criteria
- Confirm party-specific dish filtering and bonus calculations

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
- `package.json` -- Project dependencies and npm scripts
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
npm install
npm run dev                    # Start development with auto-rebuild
npm run build:data            # Rebuild data only
npm run lint && npm run format # Code quality checks
npm run test                  # Run tests
npm run build                 # Production build
```

**Debugging Data Issues:**
- Check CSV files in `data/` directory for format issues
- Review console output from `npm run build:data` for validation errors
- Verify generated JSON files in `src/lib/data/` contain expected data
- Run TypeScript compiler to catch type issues

## Performance Notes

- Data processing is optimized for build-time rather than runtime
- JSON bundles include pre-computed search indexes and sort keys
- Application uses client-side filtering and search for responsiveness
- Production builds include optimized asset bundling and minification

Fixes #14.