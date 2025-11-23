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

### Error Tracking & Monitoring

- **Honeybadger.io** (`@honeybadger-io/js`) - Exception tracking and error monitoring for both client and server-side errors

### Deployment

- **Cloudflare Pages** - Hosting platform (using `@sveltejs/adapter-cloudflare`)

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

## Error Tracking with Honeybadger

The application uses Honeybadger.io for exception tracking and error monitoring in both development and production environments.

### Setup

1. Sign up for a free account at [Honeybadger.io](https://app.honeybadger.io)
2. Create a new project and get your API key
3. Copy `.env.example` to `.env` and add your Honeybadger API key:

```bash
cp .env.example .env
# Edit .env and add your API key
```

4. Configure environment variables:

```bash
# .env
PUBLIC_HONEYBADGER_API_KEY=your_api_key_here
PUBLIC_HONEYBADGER_ENVIRONMENT=development  # or production
HONEYBADGER_API_KEY=your_api_key_here
HONEYBADGER_ENVIRONMENT=development
```

### Features

- **Automatic error tracking**: Both client-side and server-side errors are automatically reported
- **Breadcrumbs**: HTTP requests and user actions are tracked for debugging context
- **Environment-aware**: Different environments (dev, staging, production) are tracked separately
- **Error filtering**: 4xx errors (like 404s) are not reported, only server errors (5xx)

### For Cloudflare Pages Deployment

Add the environment variables in the Cloudflare Pages dashboard:

- `PUBLIC_HONEYBADGER_API_KEY`
- `PUBLIC_HONEYBADGER_ENVIRONMENT` (set to "production")
- `HONEYBADGER_API_KEY`
- `HONEYBADGER_ENVIRONMENT` (set to "production")

Optionally, you can also set `PUBLIC_HONEYBADGER_REVISION` and `HONEYBADGER_REVISION` to the git commit hash for better error tracking across deployments.

## Disclaimer

BanchoBox is a fan-made companion tool for Dave the Diver. It is not affiliated with the game's developers or publishers. All game assets are used for informational purposes under fair use guidelines.
