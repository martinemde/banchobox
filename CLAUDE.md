# BanchoBox - Dave the Diver Companion App

## Overview

BanchoBox is a SvelteKit-based companion application for the game **Dave the Diver**. It helps players manage their in-game sushi restaurant (Bancho's Sushi Bar) by providing tools for menu planning, ingredient tracking, profitability analysis, and party event optimization.

The app processes game data from CSV files into optimized JSON bundles, allowing players to:

- Browse a complete dish database with unlock conditions, pricing, and party bonuses
- Track ingredients with sources and gathering information
- Plan menus based on profitability and party events
- Manage staff assignments based on Cooksta tier
- Monitor restaurant progression and advancement requirements

Visit the live application at: **[banchobox.com](https://banchobox.com)**

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

### Error Tracking & Monitoring

- **Sentry** (`@sentry/sveltekit`) - Exception tracking and performance monitoring
  - Free tier: 5,000 errors/month
  - Features: Error tracking, session replay, performance tracing
  - Integration: Client and server-side error capture

## Package Manager: BUN ONLY

**IMPORTANT**: This project uses **Bun** as the package manager and runtime.

### DO NOT use npm, yarn, or pnpm

Always use `bun` commands:

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Run linting
bun run lint

# Format code
bun run format
```

## Project Structure

```
banchobox/
├── data/                    # CSV source data files
├── scripts/                 # Build scripts (e.g., build-database.ts)
├── src/
│   ├── lib/
│   │   ├── data/           # Compiled JSON data bundles
│   │   ├── stores/         # Svelte stores for state management
│   │   ├── ui/             # Reusable UI components
│   │   ├── images/         # Static images and game assets
│   │   └── types.ts        # TypeScript type definitions
│   └── routes/
│       ├── +page.svelte    # Home page
│       ├── dishes/         # Dish database pages
│       ├── ingredients/    # Ingredient catalog pages
│       ├── parties/        # Party events pages
│       ├── staff/          # Staff management pages
│       └── tracking/       # Dish tracking pages
└── tests/                  # Test files
```

## Data Processing

The app uses a build-time data processing pipeline:

1. CSV files in `data/` directory contain game data
2. `scripts/build-database.ts` processes CSVs with Zod validation
3. Optimized JSON bundles are generated in `src/lib/data/`
4. The `build:data` script runs automatically before `dev` and `build`

```bash
# Manually rebuild data bundles
bun run build:data
```

## Development Workflow

### Starting Development

```bash
# Install dependencies
bun install

# Start dev server (builds data automatically)
bun run dev

# Start dev server and open browser
bun run dev -- --open
```

### Code Quality

```bash
# Run type checking
bun run check

# Run type checking in watch mode
bun run check:watch

# Lint and format
bun run lint
bun run format
```

### Testing

```bash
# Run unit tests
bun run test:unit

# Run E2E tests
bun run test:e2e

# Run all tests
bun run test
```

## Key Features

### State Management

- **Cooksta Store**: Tracks restaurant tier and capabilities
- **Chapter Store**: Manages story progression
- **Dish Tracking Store**: Persists user-selected dishes
- **Party Store**: Handles party event data
- **Staff Store**: Manages hired staff and assignments

### Persistent Storage

User preferences and tracking data are persisted to localStorage for a seamless experience across sessions.

### Responsive Design

Built with Skeleton's responsive components and TailwindCSS utilities for mobile-first design.

## Deployment

The app is configured for Cloudflare Pages deployment:

```bash
# Build for production
bun run build

# Preview production build locally
bun run preview
```

The production build uses `@sveltejs/adapter-cloudflare` for optimal performance on Cloudflare's edge network.

## Error Tracking with Sentry

BanchoBox uses Sentry for exception tracking and performance monitoring. This helps catch and debug errors in production.

### Setup

1. **Create a Sentry account** at [sentry.io](https://sentry.io) (free tier: 5,000 errors/month)

2. **Create a new SvelteKit project** in Sentry

3. **Copy environment variables** from `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

4. **Configure your DSN** in `.env`:
   - Get your DSN from: Sentry → Settings → Projects → [Your Project] → Client Keys (DSN)
   - Set `PUBLIC_SENTRY_DSN` with your project's DSN

5. **(Optional) Configure source maps upload** for better stack traces:
   - Create an auth token: Sentry → Settings → Account → API → Auth Tokens
   - Set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in `.env`
   - Source maps will be uploaded automatically during production builds

### Testing Error Tracking

Visit `/test-error` in development to trigger a test error and verify Sentry is capturing exceptions:

```bash
bun run dev
# Navigate to http://localhost:5173/test-error
```

**Note:** Remember to remove the `/test-error` route before production deployment.

### Configuration Files

- `src/hooks.client.ts` - Client-side error tracking and session replay
- `src/hooks.server.ts` - Server-side error tracking for Cloudflare Workers
- `src/instrumentation.server.ts` - Server initialization with SvelteKit instrumentation
- `svelte.config.js` - Enables experimental instrumentation and tracing
- `vite.config.ts` - Sentry plugin for automatic source maps upload
- `wrangler.jsonc` - Cloudflare compatibility flags and version metadata

### Features Enabled

- **Error Tracking**: Automatic capture of unhandled exceptions
- **Session Replay**: Visual replay of user sessions when errors occur (10% sample rate)
- **Performance Tracing**: Transaction and span tracking (100% in development)
- **Source Maps**: Uploaded automatically for readable stack traces

## Disclaimer

BanchoBox is a fan-made companion tool for Dave the Diver. It is not affiliated with the game's developers or publishers. All game assets are used for informational purposes under fair use guidelines.
