# Bancho Box

A companion app for **Dave the Diver**, built to help players have fun managing the restaurant.

**🌐 Visit the application:** [banchobox.com](https://banchobox.com)

## Features

- **Complete dish database** with unlock conditions, pricing, and party bonuses
- **Comprehensive ingredient catalog** with sources and gathering information
- **Party event listings** with associated dishes and bonus multipliers
- **Internationalization support** with English and Spanish languages, ready for community translations

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

## Internationalization

BanchoBox supports multiple languages to serve the global Dave the Diver community:

### Supported Languages

- **English** (default)
- **Spanish** (Español)

### For Contributors

The internationalization system uses Svelte stores for reactive translations:

**Translation Files:**

- `src/lib/i18n/translations/en.json` - English
- `src/lib/i18n/translations/es.json` - Spanish

**Adding New Languages:**

1. Create a new translation file in `src/lib/i18n/translations/[language-code].json`
2. Add the language to `supportedLanguages` in `src/lib/i18n/index.ts`
3. Update the `Language` type definition

**Translation Keys:**
Use nested keys for organization:

```json
{
	"header": {
		"dishes": "Dishes",
		"ingredients": "Ingredients"
	},
	"home": {
		"title": "Chef Bancho's Sushi Bar"
	}
}
```

**Usage in Components:**

```svelte
<script>
	import { t } from '$lib/i18n/index.js';
</script>

<h1>{$t('home.title')}</h1><p>{$t('common.loading')}</p>
```

The language preference is automatically saved to localStorage and persists across sessions.

## Disclaimer

Bancho Box is a fan-made database for Dave the Diver. It is not affiliated with Dave the Diver or its developers or publishers. Assets are sourced from the game and used for informational purposes only under fair use guidelines. All assets are the property of their respective owners and are used with the intent to encourage more people to enjoy playing Dave the Diver.
