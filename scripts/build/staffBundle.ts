import type { EntityBundle, Id, Staff } from '../../src/lib/types.js';
import type { StaffInputRow } from './types.js';

function normalize(value: unknown): string {
	return (value ?? '').toString().toLowerCase();
}

function computeStaff(inputRows: StaffInputRow[]): Staff[] {
	const rows: Staff[] = inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => {
			const skills = [row.skillLevel3, row.skillLevel7].filter(Boolean) as string[];

			const search = [row.name, ...skills].map(normalize).join(' ');

			const sort: Staff['sort'] = {
				name: normalize(row.name),
				hiringFee: row.hiringFee,
				wageMax: row.wageMax,
				cookingStatMax: row.cookingStatMax,
				servingStatMax: row.servingStatMax,
				procureStatMax: row.procureStatMax,
				appealStatMax: row.appealStatMax,
				seasoningsMaxLevel20: row.seasoningsMaxLevel20
			};

			const staff: Staff = {
				...row,
				search,
				sort
			};

			return staff;
		})
		.sort((a, b) => (a.sort.name as string).localeCompare(b.sort.name as string));
	return rows;
}

export function buildStaffBundle(inputRows: StaffInputRow[]): EntityBundle<Staff> {
	const rows = computeStaff(inputRows);
	const byId = Object.fromEntries(rows.map((s) => [s.id, s])) as Record<Id, Staff>;

	const facets: EntityBundle<Staff>['facets'] = {
		DLC: {},
		Skill: {}
	};

	for (const r of rows) {
		const dlc = (r.dlc ?? 'Base').toString();
		(facets.DLC[dlc] ??= []).push(r.id);

		const skills = [r.skillLevel3, r.skillLevel7].filter(Boolean) as string[];
		for (const skill of skills) {
			(facets['Skill'][skill] ??= []).push(r.id);
		}
	}

	return { rows, byId, facets };
}
