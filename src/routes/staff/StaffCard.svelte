<script lang="ts">
	import type { Staff } from '$lib/types.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import { Soup } from '@lucide/svelte';
	import { hiredStaffIds } from '$lib/stores/hiredStaff.js';

	let { staff }: { staff: Staff } = $props();

	// Lazy-load recipes table only when opened
	type RecipesTableComponent = typeof import('./StaffRecipesTable.svelte').default;
	let LazyRecipesTable: RecipesTableComponent | null = $state(null);
	function ensureRecipesTableLoaded() {
		if (!LazyRecipesTable) {
			import('./StaffRecipesTable.svelte').then((m) => (LazyRecipesTable = m.default));
		}
	}

	// Controlled accordion value
	let value = $state<string[]>([]);
	function onAccordionValueChange(e: { value?: unknown }) {
		value = (e?.value as string[]) ?? [];
		if (Array.isArray(value) && value.includes('recipes')) ensureRecipesTableLoaded();
	}

	// Track hired staff using centralized store
	const isHired = $derived($hiredStaffIds && $hiredStaffIds.has(staff.id));

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value as number)) return '—';
		return new Intl.NumberFormat().format(Math.round(value as number));
	}

	function toggleHired() {
		hiredStaffIds.toggle(staff.id);
	}

	const skills = $derived([staff.skillLevel3, staff.skillLevel7].filter(Boolean) as string[]);
</script>

<article
	id="staff-{staff.id}"
	class="divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover"
>
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block">
				<div class="relative grid place-items-center">
					<PixelIcon image={staff.image} alt={staff.name} uiScale={1} tile={96} />
				</div>
				<button
					type="button"
					onclick={toggleHired}
					class="mt-2 btn w-24 rounded px-2 py-1 text-xs font-medium transition-colors {isHired
						? 'preset-filled-tertiary-500'
						: 'preset-filled-surface-500'}"
				>
					{isHired ? 'Hired' : 'Hire'}
				</button>
			</div>

			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex items-center gap-2">
					<h3 class="m-0 truncate h5 leading-none">{staff.name}</h3>
				</div>

				{#if skills.length > 0}
					<div class="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-90">
						{#each skills as s (s)}
							<span class="badge preset-filled-tertiary-100-900 px-2 py-0.5">{s}</span>
						{/each}
					</div>
				{/if}

				<table class="w-full text-sm">
					<thead>
						<tr>
							<th class="text-right">Cooking</th>
							<th class="text-right">Serving</th>
							<th class="text-right">Procure</th>
							<th class="text-right">Appeal</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="text-right tabular-nums">{formatNumber(staff.cookingStatMax)}</td>
							<td class="text-right tabular-nums">{formatNumber(staff.servingStatMax)}</td>
							<td class="text-right tabular-nums">{formatNumber(staff.procureStatMax)}</td>
							<td class="text-right tabular-nums">{formatNumber(staff.appealStatMax)}</td>
						</tr>
					</tbody>
				</table>

				<div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
					<div class="flex items-center justify-between gap-2">
						<span class="opacity-70">Hiring Fee</span>
						<span class="tabular-nums">{formatNumber(staff.hiringFee)}</span>
					</div>
					<div class="flex items-center justify-between gap-2">
						<span class="opacity-70">Wage Max</span>
						<span class="tabular-nums">{formatNumber(staff.wageMax)}</span>
					</div>
					<div class="flex items-center justify-between gap-2">
						<span class="opacity-70">Procure Max</span>
						<span class="tabular-nums">{formatNumber(staff.seasoningsMaxLevel20)} (@ Lv.20)</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 2: Recipes using this staff member -->
	{#if staff.dishes.length > 0}
		<section class="border-t border-surface-200-800">
			<Accordion {value} onValueChange={onAccordionValueChange} collapsible>
				<Accordion.Item
					value="recipes"
					controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
				>
					{#snippet lead()}
						<Soup size={16} />
					{/snippet}

					{#snippet control()}
						<span class="text-xs font-semibold tracking-wide uppercase">
							{staff.dishes.length}
							{staff.dishes.length > 1 ? 'Recipes' : 'Recipe'}
						</span>
					{/snippet}

					{#snippet panel()}
						{#if value.includes('recipes') && LazyRecipesTable}
							<LazyRecipesTable {staff} />
						{/if}
					{/snippet}
				</Accordion.Item>
			</Accordion>
		</section>
	{/if}
</article>
