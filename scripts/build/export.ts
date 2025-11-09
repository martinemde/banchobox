import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
	Dish,
	Party,
	Ingredient,
	PartyDish,
	EntityBundle,
	CookstaTier,
	DLC,
	Chapter,
	Staff
} from '../../src/lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateHash(content: string): string {
	return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

export function exportData(args: {
	dishesBundle: EntityBundle<Dish>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<Party>;
	partyDishesBundle: EntityBundle<PartyDish>;
	cookstaBundle: EntityBundle<CookstaTier>;
	dlcBundle: EntityBundle<DLC>;
	chaptersBundle: EntityBundle<Chapter>;
	staffBundle: EntityBundle<Staff>;
}) {
	const {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	} = args;

	// Setup output directories
	const srcOutputDir = join(__dirname, '..', '..', 'src', 'lib', 'data');
	const staticOutputDir = join(__dirname, '..', '..', 'static', 'data');

	mkdirSync(srcOutputDir, { recursive: true });
	mkdirSync(staticOutputDir, { recursive: true });

	const version = 'v1';

	// Helper to write both versions of a file
	const manifest: Record<string, string> = {};

	function writeBundle<T>(name: string, bundle: EntityBundle<T>) {
		const content = JSON.stringify(bundle, null, 2);
		const hash = generateHash(content);
		const hashedFilename = `${name}.${hash}.json`;
		const versionedFilename = `${name}.${version}.json`;

		// Write to src/lib/data (for gradual migration - current imports)
		writeFileSync(join(srcOutputDir, versionedFilename), content);

		// Write to static/data with hash (for new fetch-based loading)
		writeFileSync(join(staticOutputDir, hashedFilename), content);

		// Add to manifest
		manifest[name] = `/data/${hashedFilename}`;

		return bundle.rows.length;
	}

	// Write all bundles
	const partiesCount = writeBundle('parties', partiesBundle);
	const partyDishesCount = writeBundle('party-dishes', partyDishesBundle);
	const dishesCount = writeBundle('dishes', dishesBundle);
	const ingredientsCount = writeBundle('ingredients', ingredientsBundle);
	const cookstaCount = writeBundle('cooksta', cookstaBundle);
	const dlcCount = writeBundle('dlc', dlcBundle);
	const chaptersCount = writeBundle('chapters', chaptersBundle);
	const staffCount = writeBundle('staff', staffBundle);

	// Write manifest to src directory for import
	const manifestPath = join(srcOutputDir, 'manifest.json');
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	console.log(`${partiesCount}\tParties`);
	console.log(`${partyDishesCount}\tParty-dishes`);
	console.log(`${dishesCount}\tDishes`);
	console.log(`${ingredientsCount}\tIngredients`);
	console.log(`${cookstaCount}\tCooksta tiers`);
	console.log(`${dlcCount}\tDLCs`);
	console.log(`${chaptersCount}\tChapters`);
	console.log(`${staffCount}\tStaff`);
	console.log(`Data exported to /src/lib/data with version ${version}`);
	console.log(`Hashed files exported to /static/data`);
	console.log(`Manifest written to ${manifestPath}\n`);
}
