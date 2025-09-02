import { describe, it, expect, beforeEach } from 'vitest';
import { loadDLCs, buildDLCBundle } from './dlcBundle.js';
import type { DLCInputRow } from '../../src/lib/types.js';

describe('dlcBundle', () => {
	describe('buildDLCBundle', () => {
		let inputRows: DLCInputRow[];

		beforeEach(() => {
			const { dlcs } = loadDLCs();
			inputRows = dlcs;
		});

		it('should create a complete bundle with rows, byId, and facets', () => {
			const bundle = buildDLCBundle(inputRows);

			expect(bundle).toHaveProperty('rows');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should transform input rows into DLC objects with computed fields', () => {
			const bundle = buildDLCBundle(inputRows);

			expect(bundle.rows).toHaveLength(3);

			bundle.rows.forEach((dlc) => {
				// Should have all original fields
				expect(dlc).toHaveProperty('id');
				expect(dlc).toHaveProperty('name');

				// Should have computed fields
				expect(dlc).toHaveProperty('sort');
				expect(dlc).toHaveProperty('search');

				// Validate search field (lowercased name)
				expect(typeof dlc.search).toBe('string');
				expect(dlc.search).toBe(dlc.name.toLowerCase());

				// Validate sort object
				expect(dlc.sort).toHaveProperty('order');
				expect(dlc.sort).toHaveProperty('name');
				expect(typeof dlc.sort.order).toBe('number');
				expect(typeof dlc.sort.name).toBe('string');
				expect(dlc.sort.name).toBe(dlc.name.toLowerCase());
			});
		});

		it('should validate specific DLC properties', () => {
			const bundle = buildDLCBundle(inputRows);

			// Test Dredge
			const dredge = bundle.byId[1];
			expect(dredge.id).toBe(1);
			expect(dredge.name).toBe('Dredge');
			expect(dredge.sort.order).toBe(1);
			expect(dredge.sort.name).toBe('dredge');
			expect(dredge.search).toBe('dredge');

			// Test Godzilla
			const godzilla = bundle.byId[2];
			expect(godzilla.id).toBe(2);
			expect(godzilla.name).toBe('Godzilla');
			expect(godzilla.sort.order).toBe(2);
			expect(godzilla.sort.name).toBe('godzilla');
			expect(godzilla.search).toBe('godzilla');

			// Test Ichiban
			const ichiban = bundle.byId[3];
			expect(ichiban.id).toBe(3);
			expect(ichiban.name).toBe('Ichiban');
			expect(ichiban.sort.order).toBe(3);
			expect(ichiban.sort.name).toBe('ichiban');
			expect(ichiban.search).toBe('ichiban');
		});
	});
});
