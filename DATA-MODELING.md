# Data Processing

This project uses a simple CSV-to-JSON processing approach that addresses the constraints of static site generation.

## Architecture Overview

```
CSV Files (Source of Truth)
    ↓
Direct CSV Processing (Build Time)
    ↓
Relationship Building & Validation
    ↓
Optimized JSON Files (Runtime)
    ↓
Static Svelte Site
```

## Benefits of This Approach

### ✅ **Simple and Direct**
- **No database dependencies** - direct CSV parsing
- **Type safety** with TypeScript interfaces
- **Data validation** during build process
- **Clear relationship mapping** between entities

### ✅ **Static Site Compatible**
- No database needed at runtime
- Serverless-friendly JSON output
- Pre-computed relationships for fast loading
- Works with any static hosting

### ✅ **Developer Experience**
- **Lightweight** build process
- **Easy to understand** and modify
- **Fast** processing without database overhead
- **Maintainable** as data complexity grows

## Data Structure

```typescript
// Core entities
dishes: { name, unlockCondition, dlc, finalLevel, finalTaste, initialPrice, finalPrice, servings, parties[], ingredients[] }
ingredients: { name, source, type, drone, kg, maxMeats, cost }
parties: { name, bonus, dishes[] }

// Embedded relationships
DishIngredient: { name, count, levels, upgradeCount }
```

## Build Process

1. **CSV Parsing**: Parse CSV files directly using built-in string processing
2. **Data Mapping**: Create Maps for efficient lookups and relationship building
3. **Relationship Building**: Link entities using name-based lookups
4. **Validation**: Warn about missing references during processing
5. **Export**: Generate optimized JSON with embedded relationships

## File Structure

```
data/
├── dishes.csv              # Source data
├── ingredients.csv         # Source data
├── parties.csv             # Source data
├── party-dishes.csv        # Dish-party relationships
└── dish-ingredients.csv    # Dish-ingredient relationships

scripts/
├── build-database.ts       # Direct CSV processor
└── process-dishes.js       # Legacy: Can be removed

src/lib/
├── dishes.json            # Generated: Dishes with parties[] and ingredients[]
├── ingredients.json       # Generated: Ingredients
└── parties.json           # Generated: Parties with dishes[]
```

## Processing Logic

```typescript
// Load and map data directly from CSV
const dishes = new Map<string, DishData>();
const ingredients = new Map<string, IngredientData>();
const parties = new Map<string, PartyData>();

// Build relationships using Maps for O(1) lookup
for (const row of partyDishRows) {
  const party = parties.get(partyName);
  const dish = dishes.get(dishName);
  if (party && dish) {
    dish.parties.push(partyName);
    party.dishes.push(dishName);
  }
}
```

## Future Enhancements

With direct CSV processing in place, we can easily add:

- **Enhanced validation** (stricter data checks)
- **Recipe requirements** (quantities, cooking steps)
- **Location-based filtering**
- **Advanced search and filtering**
- **Data transformation rules**
- **Import/export tools for community contributions**

## Commands

```bash
# Install dependencies
npm install

# Build data using CSV processor
npm run build-data

# Development (uses CSV processor)
npm run dev

# Fallback to old process if needed
npm run process-data
```

This approach provides a simple, efficient solution: direct CSV processing with full relationship support and static site compatibility.
