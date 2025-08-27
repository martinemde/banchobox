# Bancho Box

A companion app for **Dave the Diver**, built to help players have fun managing the restaurant.

**🌐 Visit the application:** [banchobox.com](https://banchobox.com)

## Features

- **Complete dish database** with unlock conditions, pricing, and party bonuses
- **Comprehensive ingredient catalog** with sources and gathering information
- **Party event listings** with associated dishes and bonus multipliers

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

## Disclaimer

Bancho Box is a fan-made database for Dave the Diver. It is not affiliated with Dave the Diver or its developers or publishers. Assets are sourced from the game and used for informational purposes only under fair use guidelines. All assets are the property of their respective owners and are used with the intent to encourage more people to enjoy playing Dave the Diver.
