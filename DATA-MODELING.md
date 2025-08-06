# Data Modeling with Drizzle

This project uses a hybrid approach for data modeling that addresses the constraints of static site generation while providing proper data modeling benefits.

## Architecture Overview

```
CSV Files (Source of Truth)
    ↓
SQLite + Drizzle (Build Time)
    ↓
Validation & Relationship Building
    ↓
Optimized JSON Files (Runtime)
    ↓
Static Svelte Site
```

## Benefits of This Approach

### ✅ **Proper Data Modeling**
- **Normalized schema** with proper foreign key relationships
- **Type safety** with Drizzle TypeScript types
- **Data validation** during build process
- **Single source of truth** for all relationships

### ✅ **Static Site Compatible**
- No database needed at runtime
- Serverless-friendly JSON output
- Pre-computed relationships for fast loading
- Works with any static hosting

### ✅ **Developer Experience**
- **Schema-first** approach with TypeScript
- **Relationship validation** prevents data inconsistencies
- **Easy to query and transform** data during build
- **Maintainable** as data complexity grows

## Schema Design

```typescript
// Core entities with proper typing
dishes: { id, name, unlockCondition, dlc, finalLevel, ... }
ingredients: { id, name, source, type, drone, ... }
parties: { id, name, bonus }

// Junction tables for many-to-many relationships
dishParties: { dishId, partyId }
dishIngredients: { dishId, ingredientId }
```

## Build Process

1. **CSV Import**: Load CSV files into SQLite database
2. **Relationship Building**: Create foreign key relationships
3. **Validation**: Ensure all references are valid
4. **Export**: Generate optimized JSON with embedded relationships

## File Structure

```
data/
├── dishes.csv              # Source data
├── ingredients.csv         # Source data
├── parties.csv             # Source data
└── party-dishes.csv        # Relationships

scripts/
├── build-database.ts       # New: Drizzle-based processor
└── process-dishes.js       # Old: Can be removed

src/lib/
├── schema.ts              # Drizzle schema definition
├── dishes.json            # Generated: Dishes with parties[]
├── ingredients.json       # Generated: Ingredients
└── parties.json           # Generated: Parties with dishes[]
```

## Example Query (Build Time)

```typescript
// Get dishes with their party bonuses
const dishesWithParties = await db
  .select({
    dish: schema.dishes,
    partyName: schema.parties.name,
  })
  .from(schema.dishes)
  .leftJoin(schema.dishParties, eq(schema.dishes.id, schema.dishParties.dishId))
  .leftJoin(schema.parties, eq(schema.dishParties.partyId, schema.parties.id));
```

## Migration Strategy

1. **Phase 1**: Install Drizzle dependencies
2. **Phase 2**: Run both old and new build processes in parallel
3. **Phase 3**: Verify JSON output is identical
4. **Phase 4**: Switch to new build process
5. **Phase 5**: Remove old processing script

## Future Enhancements

With proper data modeling in place, we can easily add:

- **Dish-Ingredient relationships**
- **Recipe requirements** (quantities, cooking steps)
- **Location-based filtering**
- **Advanced search and filtering**
- **Data validation rules**
- **Import/export tools for community contributions**

## Commands

```bash
# Install dependencies
npm install

# Build data using new process
npm run build-data

# Development (uses new build process)
npm run dev

# Fallback to old process if needed
npm run process-data
```

This approach gives you the best of both worlds: proper data modeling during development with static site compatibility for deployment.
