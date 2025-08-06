import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Core entities
export const dishes = sqliteTable('dishes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  unlockCondition: text('unlock_condition'),
  dlc: text('dlc'),
  finalLevel: integer('final_level').notNull(),
  finalTaste: integer('final_taste').notNull(),
  initialPrice: integer('initial_price').notNull(),
  finalPrice: integer('final_price').notNull(),
  servings: integer('servings').notNull(),
});

export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  source: text('source'),
  type: text('type'),
  drone: integer('drone', { mode: 'boolean' }).notNull(),
  kg: real('kg'),
  maxMeats: integer('max_meats'),
  cost: integer('cost'),
});

export const parties = sqliteTable('parties', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  bonus: real('bonus').notNull(),
});

// Junction tables for relationships
export const dishParties = sqliteTable('dish_parties', {
  id: integer('id').primaryKey(),
  dishId: integer('dish_id').notNull().references(() => dishes.id),
  partyId: integer('party_id').notNull().references(() => parties.id),
});

export const dishIngredients = sqliteTable('dish_ingredients', {
  id: integer('id').primaryKey(),
  dishId: integer('dish_id').notNull().references(() => dishes.id),
  ingredientId: integer('ingredient_id').notNull().references(() => ingredients.id),
  count: integer('count').notNull(),
  levels: integer('levels'),
  upgradeCount: integer('upgrade_count'),
});

// Relations
export const dishesRelations = relations(dishes, ({ many }) => ({
  dishParties: many(dishParties),
  dishIngredients: many(dishIngredients),
}));

export const partiesRelations = relations(parties, ({ many }) => ({
  dishParties: many(dishParties),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  dishIngredients: many(dishIngredients),
}));

export const dishPartiesRelations = relations(dishParties, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishParties.dishId],
    references: [dishes.id],
  }),
  party: one(parties, {
    fields: [dishParties.partyId],
    references: [parties.id],
  }),
}));

export const dishIngredientsRelations = relations(dishIngredients, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishIngredients.dishId],
    references: [dishes.id],
  }),
  ingredient: one(ingredients, {
    fields: [dishIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));
