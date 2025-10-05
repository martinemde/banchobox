import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
	const layoutData = await parent();
	const staff = layoutData.staff;

	// Parse URL params
	const sortKey = url.searchParams.get('sort') || 'wageMax';
	const sortDir = (url.searchParams.get('dir') || 'desc') as 'asc' | 'desc';
	const query = url.searchParams.get('q') || '';

	// Get sorted staff with fallback logic
	let sortedIds: number[] = [];
	if (staff.sorted[sortKey]) {
		// Exact match
		if (staff.sorted[sortKey][sortDir]) {
			sortedIds = staff.sorted[sortKey][sortDir];
		} else {
			// Use opposite direction and reverse
			const oppositeDir = sortDir === 'asc' ? 'desc' : 'asc';
			if (staff.sorted[sortKey][oppositeDir]) {
				sortedIds = [...staff.sorted[sortKey][oppositeDir]].reverse();
			}
		}
	}

	let items = sortedIds.map((id) => staff.byId[id]).filter(Boolean);

	// Apply search filter
	if (query.trim()) {
		const q = query.toLowerCase();
		items = items.filter((s) => s.search?.includes(q));
	}

	return {
		staff: items,
		sortKey,
		sortDir,
		query
	};
};
