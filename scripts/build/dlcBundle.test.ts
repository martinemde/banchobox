import { describe, it, expect, beforeEach } from 'vitest';
import { loadDLCs, buildDLCs } from './dlcBundle.js';
import type { DLCInputRow } from '../../src/lib/types.js';

describe('dlcBundle', () => {
	describe('buildDLCs', () => {
		let inputRows: DLCInputRow[];

		beforeEach(() => {
			const { dlcs } = loadDLCs();
			inputRows = dlcs;
		});

		it('should create a sorted array of DLCs', () => {
			const dlcs = buildDLCs(inputRows);

			expect(Array.isArray(dlcs)).toBe(true);
			expect(dlcs).toHaveLength(3);
		});

		it('should transform input rows into DLC objects', () => {
			const dlcs = buildDLCs(inputRows);

			expect(dlcs).toHaveLength(3);

			dlcs.forEach((dlc) => {
				// Should have all required fields
				expect(dlc).toHaveProperty('id');
				expect(dlc).toHaveProperty('name');

				// Should NOT have computed sort or search fields
				expect(dlc).not.toHaveProperty('sort');
				expect(dlc).not.toHaveProperty('search');
			});
		});

		it('should validate specific DLC properties', () => {
			const dlcs = buildDLCs(inputRows);

			// Test Dredge
			const dredge = dlcs.find((d) => d.id === 1);
			expect(dredge).toBeDefined();
			expect(dredge?.id).toBe(1);
			expect(dredge?.name).toBe('Dredge');

			// Test Godzilla
			const godzilla = dlcs.find((d) => d.id === 2);
			expect(godzilla).toBeDefined();
			expect(godzilla?.id).toBe(2);
			expect(godzilla?.name).toBe('Godzilla');

			// Test Ichiban
			const ichiban = dlcs.find((d) => d.id === 3);
			expect(ichiban).toBeDefined();
			expect(ichiban?.id).toBe(3);
			expect(ichiban?.name).toBe('Ichiban');
		});

		it('should sort DLCs by order field', () => {
			const dlcs = buildDLCs(inputRows);

			// Verify the DLCs are in the expected order
			expect(dlcs[0].name).toBe('Dredge');
			expect(dlcs[1].name).toBe('Godzilla');
			expect(dlcs[2].name).toBe('Ichiban');
		});
	});
});
