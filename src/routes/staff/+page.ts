import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const layoutData = await parent();

	// Return the full bundle - let the component handle filtering/sorting
	return {
		staffBundle: layoutData.staff
	};
};
