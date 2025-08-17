# Bancho Box

A comprehensive database application for **Dave the Diver**, built with modern web technologies to help players navigate the game's complex culinary system.

**🌐 Visit the live application:** [banchobox.com](https://banchobox.com)

## Features

- **Complete dish database** with unlock conditions, pricing, and party bonuses (305 dishes)
- **Comprehensive ingredient catalog** with sources and gathering information (228 ingredients)
- **Party event listings** with associated dishes and bonus multipliers (8 parties)
- **Dark/light theme support** for comfortable viewing
- **Responsive design** for desktop and mobile devices

## Technology Stack

This application is built with [SvelteKit](https://svelte.dev/docs/kit) and styled with [Skeleton UI](https://skeleton.dev) for a modern, accessible user experience.

## Development

### Prerequisites

Install dependencies:

```sh
npm install
```

### Data Processing

The application processes CSV data files into optimized JSON bundles. Before running the development server, you need to build the data:

```sh
npm run build:data
```

This command imports and pre-computes data from CSV files in the `data/` directory, creating optimized JSON files in `src/lib/data/`.

### Running the Development Server

Start the development server (this automatically runs `build:data` first):

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building for Production

To create a production version of the app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Project Structure

- `data/` - CSV files containing dishes, ingredients, parties, and relationships
- `scripts/build-database.ts` - Data processing script that converts CSV to JSON
- `src/lib/data/` - Generated JSON data files (created by `build:data`)
- `src/routes/` - SvelteKit application pages and components

## Disclaimer

Bancho Box is a fan-made database for Dave the Diver. It is not affiliated with Dave the Diver or its developers or publishers. Assets are sourced from the game and used for informational purposes only under fair use guidelines. All assets are the property of their respective owners and are used with the intent to encourage more people to enjoy playing Dave the Diver.
