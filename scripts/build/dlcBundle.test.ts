import { describe, it, expect, beforeEach } from 'vitest';
import { loadDLCs, buildDLCBundle } from './dlcBundle.js';
import type { DLCInputRow } from './types.js';

describe('dlcBundle', () => {
	describe('buildDLCBundle', () => {
		let inputRows: DLCInputRow[];

		beforeEach(() => {
			const { dlcs } = loadDLCs();
			inputRows = dlcs;
		});

		it('should create a complete bundle with sorted, byId, and facets', () => {
			const bundle = buildDLCBundle(inputRows);

			expect(bundle).toHaveProperty('sorted');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should transform input rows into DLC objects with computed fields', () => {
			const bundle = buildDLCBundle(inputRows);

			const dlcs = Object.values(bundle.byId);
			expect(dlcs).toHaveLength(3);

			dlcs.forEach((dlc) => {
				// Should have all original fields
				expect(dlc).toHaveProperty('id');
				expect(dlc).toHaveProperty('name');

				// Computed fields are at bundle level, not on individual DLC objects
				expect(dlc).toHaveProperty('search');

				// Validate search field (lowercased name)
				expect(typeof dlc.search).toBe('string');
				expect(dlc.search).toBe(dlc.name.toLowerCase());
			});
		});

		it('should validate specific DLC properties', () => {
			const bundle = buildDLCBundle(inputRows);

			// Test Dredge
			const dredge = bundle.byId[1];
			expect(dredge.id).toBe(1);
			expect(dredge.name).toBe('Dredge');
			expect(dredge.search).toBe('dredge');

			// Test Godzilla
			const godzilla = bundle.byId[2];
			expect(godzilla.id).toBe(2);
			expect(godzilla.name).toBe('Godzilla');
			expect(godzilla.search).toBe('godzilla');

			// Test Ichiban
			const ichiban = bundle.byId[3];
			expect(ichiban.id).toBe(3);
			expect(ichiban.name).toBe('Ichiban');
			expect(ichiban.search).toBe('ichiban');
		});
	});
});
