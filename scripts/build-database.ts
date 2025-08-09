import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
	Dish,
	Ingredient,
	Party,
	DishIngredient,
	DishParty,
	Id,
	PartyDish,
	EnrichedDish,
	EnrichedIngredient,
	EnrichedParty,
	IngredientLine
} from '../src/lib/types.js';
import { buildGraph } from '../src/lib/graph/index.js';
import { recipeCost, lineCost } from '../src/lib/calc/costs.js';
import { partyPrice } from '../src/lib/calc/price.js';
import { partyProfitPerDish } from '../src/lib/calc/profit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseCSV(csvContent: string, filename?: string): Array<Record<string, string>> {
	const lines = csvContent.trim().split('\n');
	if (lines.length < 2) {
		console.warn(`${filename || 'CSV file'} has no data rows`);
		return [];
	}

	const headers = lines[0].split(',').map((h) => h.trim());
	const rows: Array<Record<string, string>> = [];

	console.log(`${filename || 'CSV file'} headers: ${headers.join(', ')}`);

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',');
		const row: Record<string, string> = {};

		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = values[j]?.trim() || '';
		}

		rows.push(row);
	}

	return rows;
}

function validateRequiredColumns(
	rows: Array<Record<string, string>>,
	requiredColumns: string[],
	filename: string
) {
	if (rows.length === 0) return;

	const availableColumns = Object.keys(rows[0]);
	const missingColumns = requiredColumns.filter((col) => !availableColumns.includes(col));

	if (missingColumns.length > 0) {
		throw new Error(
			`${filename} is missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}`
		);
	}
}

function loadDishes() {
	const dishesCSV = readFileSync(join(__dirname, '..', 'data', 'dishes.csv'), 'utf-8');
	const dishRows = parseCSV(dishesCSV, 'dishes.csv');
	validateRequiredColumns(
		dishRows,
		['Dish Name', 'Final Level', 'Final Taste', 'Initial Price', 'Final Price', 'Servings'],
		'dishes.csv'
	);

	const dishes: Dish[] = [];
	const dishNameToId = new Map<string, Id>();

	dishRows.forEach((row, index) => {
		if (row['Dish Name']) {
			const id = index + 1; // Start IDs at 1
			const dish: Dish = {
				id,
				name: row['Dish Name'],
				final_level: parseInt(row['Final Level']) || 0,
				final_taste: parseInt(row['Final Taste']) || 0,
				initial_price: parseInt(row['Initial Price']) || 0,
				final_price: parseInt(row['Final Price']) || 0,
				servings: parseInt(row['Servings']) || 0,
				unlock_condition: row['Unlock Condition'] || null,
				dlc: row['DLC'] || null
			};
			dishes.push(dish);
			dishNameToId.set(row['Dish Name'], id);
		}
	});

	return { dishes, dishNameToId };
}

function loadIngredients() {
	const ingredientsCSV = readFileSync(join(__dirname, '..', 'data', 'ingredients.csv'), 'utf-8');
	const ingredientRows = parseCSV(ingredientsCSV, 'ingredients.csv');
	validateRequiredColumns(ingredientRows, ['Ingredient'], 'ingredients.csv');

	const ingredients: Ingredient[] = [];
	const ingredientNameToId = new Map<string, Id>();

	ingredientRows.forEach((row, index) => {
		if (row['Ingredient']) {
			const id = index + 1; // Start IDs at 1
			const ingredient: Ingredient = {
				id,
				name: row['Ingredient'],
				source: row['Source'] || undefined,
				type: row['Type'] || undefined,
				drone: row['Drone'] === 'checked' ? 1 : 0,
				kg: parseFloat(row['kg']) || null,
				max_meats: parseInt(row['Max Meats']) || null,
				cost: parseInt(row['Cost']) || null
			};
			ingredients.push(ingredient);
			ingredientNameToId.set(row['Ingredient'], id);
		}
	});

	return { ingredients, ingredientNameToId };
}

function loadParties() {
	const partiesCSV = readFileSync(join(__dirname, '..', 'data', 'parties.csv'), 'utf-8');
	const partyRows = parseCSV(partiesCSV, 'parties.csv');
	validateRequiredColumns(partyRows, ['Party', 'Bonus', 'Order'], 'parties.csv');

	const parties: Party[] = [];
	const partyNameToId = new Map<string, Id>();

	partyRows.forEach((row, index) => {
		if (row['Party']) {
			const id = index + 1; // Start IDs at 1
			const party: Party = {
				id,
				name: row['Party'],
				bonus: parseFloat(row['Bonus']) || 0,
				order: parseInt(row['Order']) || 0
			};
			parties.push(party);
			partyNameToId.set(row['Party'], id);
		}
	});

	// Sort parties by order to ensure static ordering
	parties.sort((a, b) => a.order - b.order);

	return { parties, partyNameToId };
}

function loadRelationships(
	dishNameToId: Map<string, Id>,
	ingredientNameToId: Map<string, Id>,
	partyNameToId: Map<string, Id>
) {
	// Load party-dish relationships
	const partyDishesCSV = readFileSync(join(__dirname, '..', 'data', 'party-dishes.csv'), 'utf-8');
	const partyDishRows = parseCSV(partyDishesCSV, 'party-dishes.csv');
	validateRequiredColumns(partyDishRows, ['Party', 'Dish'], 'party-dishes.csv');

	const dishParties: DishParty[] = [];
	for (const row of partyDishRows) {
		if (row['Party'] && row['Dish'] && row['Dish'].trim()) {
			const partyId = partyNameToId.get(row['Party'].trim());
			const dishId = dishNameToId.get(row['Dish'].trim());

			if (partyId && dishId) {
				dishParties.push({
					dish_id: dishId,
					party_id: partyId
				});
			} else {
				console.warn(`Could not find party "${row['Party']}" or dish "${row['Dish']}"`);
			}
		}
	}

	// Load dish-ingredient relationships
	const dishIngredientsCSV = readFileSync(
		join(__dirname, '..', 'data', 'dish-ingredients.csv'),
		'utf-8'
	);
	const dishIngredientRows = parseCSV(dishIngredientsCSV, 'dish-ingredients.csv');
	validateRequiredColumns(
		dishIngredientRows,
		['Dish', 'Count', 'Ingredient'],
		'dish-ingredients.csv'
	);

	const dishIngredients: DishIngredient[] = [];
	for (const row of dishIngredientRows) {
		if (row['Dish'] && row['Count'] && row['Ingredient'] && row['Ingredient'].trim()) {
			const dishId = dishNameToId.get(row['Dish'].trim());
			const ingredientId = ingredientNameToId.get(row['Ingredient'].trim());
			const count = parseInt(row['Count']) || 0;
			const levels = parseInt(row['Levels']) || null;
			const upgradeCount = parseInt(row['Upgrade Count']) || null;

			if (dishId && ingredientId) {
				dishIngredients.push({
					dish_id: dishId,
					ingredient_id: ingredientId,
					count,
					levels,
					upgrade_count: upgradeCount
				});
			} else {
				console.warn(`Could not find dish "${row['Dish']}" or ingredient "${row['Ingredient']}"`);
			}
		}
	}

	return { dishIngredients, dishParties };
}

function loadNormalizedData() {
	console.log('Loading and normalizing data from CSV files...');

	const { dishes, dishNameToId } = loadDishes();
	const { ingredients, ingredientNameToId } = loadIngredients();
	const { parties, partyNameToId } = loadParties();
	const { dishIngredients, dishParties } = loadRelationships(
		dishNameToId,
		ingredientNameToId,
		partyNameToId
	);

	return { dishes, ingredients, parties, dishIngredients, dishParties };
}

function enrichData(
	dishes: Dish[],
	ingredients: Ingredient[],
	parties: Party[],
	dishIngredients: DishIngredient[],
	dishParties: DishParty[]
) {
	console.log('Building graph and enriching data...');

	const graph = buildGraph(dishes, ingredients, parties, dishIngredients, dishParties);

	// First, create PartyDish entities for all party-dish combinations
	console.log('Creating PartyDish entities...');
	const partyDishes: PartyDish[] = [];
	let partyDishIdCounter = 1;

	for (const dishParty of dishParties) {
		const dish = graph.dishById.get(dishParty.dish_id);
		const party = graph.partyById.get(dishParty.party_id);

		if (!dish || !party) continue;

		// Get ingredient lines for this dish
		const ingLines: IngredientLine[] = (graph.ingByDishId.get(dish.id) ?? []).map((line) => ({
			count: line.count,
			unitCost: graph.ingById.get(line.ingredient_id)?.cost ?? null
		}));

		// Recipe cost is calculated per dish, not per party-dish combination
		const dishPartyPrice = partyPrice(dish, party);
		const dishPartyRevenue = dishPartyPrice * dish.servings;
		const dishProfit = partyProfitPerDish(dish, party, ingLines);
		const dishProfitPerServing = dishProfit / dish.servings;

		const partyDish: PartyDish = {
			id: partyDishIdCounter++,
			partyId: party.id,
			dishId: dish.id,
			partyPrice: dishPartyPrice,
			partyRevenue: dishPartyRevenue,
			profit: dishProfit,
			profitPerServing: dishProfitPerServing
		};

		partyDishes.push(partyDish);
	}

	// Create lookup maps for PartyDish entities
	const partyDishById = new Map<Id, PartyDish>();
	const partyDishesByDishId = new Map<Id, PartyDish[]>();
	const partyDishesByPartyId = new Map<Id, PartyDish[]>();

	for (const partyDish of partyDishes) {
		partyDishById.set(partyDish.id, partyDish);

		if (!partyDishesByDishId.has(partyDish.dishId)) {
			partyDishesByDishId.set(partyDish.dishId, []);
		}
		partyDishesByDishId.get(partyDish.dishId)!.push(partyDish);

		if (!partyDishesByPartyId.has(partyDish.partyId)) {
			partyDishesByPartyId.set(partyDish.partyId, []);
		}
		partyDishesByPartyId.get(partyDish.partyId)!.push(partyDish);
	}

	// Enrich dishes with precomputed values
	const enrichedDishes: EnrichedDish[] = dishes.map((dish) => {
		// Get ingredient lines for this dish with upgrade counts
		const dishIngredientData = graph.dishIngredients.filter((di) => di.dish_id === dish.id);
		const ingredientLines = (graph.ingByDishId.get(dish.id) ?? []).map((line) => {
			const dishIngredient = dishIngredientData.find(
				(di) => di.ingredient_id === line.ingredient_id
			);
			const unitCost = graph.ingById.get(line.ingredient_id)?.cost ?? null;

			return {
				ingredientId: line.ingredient_id,
				count: line.count,
				unitCost,
				lineCost: lineCost(line.count, unitCost),
				upgradeCount: dishIngredient?.upgrade_count ?? null
			};
		});

		// Calculate recipe cost
		const ingLines: IngredientLine[] = ingredientLines.map((line) => ({
			count: line.count,
			unitCost: line.unitCost
		}));
		const dishRecipeCost = recipeCost(ingLines);

		// Get PartyDish entities for this dish
		const dishPartyDishes = partyDishesByDishId.get(dish.id) ?? [];
		const partyDishIds = dishPartyDishes.map((pd) => pd.id);

		// Find best party dish (highest profit)
		const bestPartyDish = dishPartyDishes.reduce(
			(best, current) => (best === null || current.profit > best.profit ? current : best),
			null as PartyDish | null
		);

		// Calculate pre-computed values to avoid view-level calculations
		const baseRevenue = dish.final_price * dish.servings;
		const baseProfit = baseRevenue - dishRecipeCost;
		const baseProfitPerServing = baseProfit / dish.servings;
		const maxProfitPerServing = bestPartyDish ? bestPartyDish.profit / dish.servings : 0;

		// Calculate upgrade cost
		const upgradeCost = ingredientLines.reduce((total, line) => {
			return total + (line.unitCost || 0) * (line.upgradeCount || 0);
		}, 0);

		// Calculate upgrade break even
		const upgradeBreakEven =
			upgradeCost > 0 && bestPartyDish ? bestPartyDish.profit / upgradeCost : 0;

		// Calculate ingredient count
		const ingredientCount = ingredientLines.reduce((total, line) => total + line.count, 0);

		// Get best party information for flattened access
		const bestParty = bestPartyDish ? graph.partyById.get(bestPartyDish.partyId) : null;
		const bestPartyName = bestParty?.name ?? null;
		const bestPartyBonus = bestParty?.bonus ?? null;
		const bestPartyPrice = bestPartyDish?.partyPrice ?? null;
		const bestPartyRevenue = bestPartyDish?.partyRevenue ?? null;

		const enrichedDish: EnrichedDish = {
			...dish,
			ingredients: ingredientLines,
			recipeCost: dishRecipeCost,
			partyDishIds,
			bestPartyDishId: bestPartyDish?.id ?? null,
			maxProfitPerDish: bestPartyDish?.profit ?? baseProfitPerServing,
			baseRevenue,
			baseProfit,
			baseProfitPerServing,
			maxProfitPerServing,
			upgradeCost,
			upgradeBreakEven,
			ingredientCount,
			bestPartyName,
			bestPartyBonus,
			bestPartyPrice,
			bestPartyRevenue
		};

		return enrichedDish;
	});

	// Enrich ingredients
	const enrichedIngredients: EnrichedIngredient[] = ingredients.map((ingredient) => {
		const usedInDishes = (graph.dishesByIngredientId.get(ingredient.id) ?? []).map((usage) => ({
			dishId: usage.dish_id,
			count: usage.count
		}));

		// Find best PartyDish for this ingredient (highest profit among all dishes that use this ingredient)
		let bestPartyDish: PartyDish | null = null;
		for (const usage of usedInDishes) {
			const dishPartyDishes = partyDishesByDishId.get(usage.dishId) ?? [];
			for (const partyDish of dishPartyDishes) {
				if (bestPartyDish === null || partyDish.profit > bestPartyDish.profit) {
					bestPartyDish = partyDish;
				}
			}
		}

		// Find all parties this ingredient is used for
		const allPartyIds = new Set<Id>();
		for (const usage of usedInDishes) {
			const dishPartyDishes = partyDishesByDishId.get(usage.dishId) ?? [];
			for (const partyDish of dishPartyDishes) {
				allPartyIds.add(partyDish.partyId);
			}
		}

		const enrichedIngredient: EnrichedIngredient = {
			...ingredient,
			usedIn: usedInDishes,
			bestPartyDishId: bestPartyDish?.id ?? null,
			usedForParties: Array.from(allPartyIds)
		};

		return enrichedIngredient;
	});

	// Enrich parties
	const enrichedParties: EnrichedParty[] = parties.map((party) => {
		// Get PartyDish entities for this party, sorted by profit descending
		const partyPartyDishes = (partyDishesByPartyId.get(party.id) ?? []).sort(
			(a, b) => b.profit - a.profit
		);

		const partyDishIds = partyPartyDishes.map((pd) => pd.id);

		const enrichedParty: EnrichedParty = {
			...party,
			partyDishIds
		};

		return enrichedParty;
	});

	// Ensure enriched parties maintain static ordering
	enrichedParties.sort((a, b) => a.order - b.order);

	return { enrichedDishes, enrichedIngredients, enrichedParties, partyDishes };
}

function exportData(
	enrichedDishes: EnrichedDish[],
	enrichedIngredients: EnrichedIngredient[],
	enrichedParties: EnrichedParty[],
	partyDishes: PartyDish[]
) {
	console.log('Exporting enriched data to JSON...');

	const outputDir = join(__dirname, '..', 'static', 'data');

	// Ensure output directory exists
	mkdirSync(outputDir, { recursive: true });

	// Export enriched data with versioning
	const version = 'v1';

	writeFileSync(join(outputDir, `dishes.${version}.json`), JSON.stringify(enrichedDishes, null, 2));

	writeFileSync(
		join(outputDir, `ingredients.${version}.json`),
		JSON.stringify(enrichedIngredients, null, 2)
	);

	writeFileSync(
		join(outputDir, `parties.${version}.json`),
		JSON.stringify(enrichedParties, null, 2)
	);

	writeFileSync(
		join(outputDir, `party-dishes.${version}.json`),
		JSON.stringify(partyDishes, null, 2)
	);

	// Also maintain legacy format in src/lib for backward compatibility during transition
	const legacyOutputDir = join(__dirname, '..', 'src', 'lib');

	// Create simple indices for client-side lookups
	const indices = {
		dishById: Object.fromEntries(enrichedDishes.map((d) => [d.id, d])),
		ingredientById: Object.fromEntries(enrichedIngredients.map((i) => [i.id, i])),
		partyById: Object.fromEntries(enrichedParties.map((p) => [p.id, p])),
		partyDishById: Object.fromEntries(partyDishes.map((pd) => [pd.id, pd]))
	};

	writeFileSync(join(outputDir, `indices.${version}.json`), JSON.stringify(indices, null, 2));

	// Legacy exports (for backward compatibility)
	writeFileSync(join(legacyOutputDir, 'dishes.json'), JSON.stringify(enrichedDishes, null, 2));

	writeFileSync(
		join(legacyOutputDir, 'ingredients.json'),
		JSON.stringify(enrichedIngredients, null, 2)
	);

	writeFileSync(join(legacyOutputDir, 'parties.json'), JSON.stringify(enrichedParties, null, 2));

	writeFileSync(join(legacyOutputDir, 'party-dishes.json'), JSON.stringify(partyDishes, null, 2));

	// Count relationships for logging
	const totalIngredientRelationships = enrichedDishes.reduce(
		(sum, dish) => sum + dish.ingredients.length,
		0
	);
	const totalPartyDishRelationships = partyDishes.length;

	console.log(
		`Exported ${enrichedDishes.length} dishes, ${enrichedParties.length} parties, ${enrichedIngredients.length} ingredients, ${partyDishes.length} party-dishes`
	);
	console.log(`Total dish-ingredient relationships: ${totalIngredientRelationships}`);
	console.log(`Total party-dish relationships: ${totalPartyDishRelationships}`);
	console.log(`Data exported to /static/data with version ${version}`);
}

// Run the build process
try {
	const { dishes, ingredients, parties, dishIngredients, dishParties } = loadNormalizedData();
	const { enrichedDishes, enrichedIngredients, enrichedParties, partyDishes } = enrichData(
		dishes,
		ingredients,
		parties,
		dishIngredients,
		dishParties
	);
	exportData(enrichedDishes, enrichedIngredients, enrichedParties, partyDishes);
	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error);
	process.exit(1);
}
