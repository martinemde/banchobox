<script lang="ts">
	import type { Staff } from '$lib/types.js';
	import PixelIcon from '$lib/ui/PixelIcon.svelte';

	let { staff }: { staff: Staff } = $props();

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value as number)) return '—';
		return new Intl.NumberFormat().format(Math.round(value as number));
	}

	const skills = $derived([staff.skillLevel3, staff.skillLevel7].filter(Boolean) as string[]);
</script>

<article
	class="divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover"
>
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block">
				{#if staff.image}
					<div class="relative grid place-items-center">
						<PixelIcon image={staff.image} alt={staff.name} uiScale={1} tile={96} />
					</div>
				{/if}
			</div>

			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex items-center gap-2">
					<h3 class="m-0 truncate h5 leading-none">{staff.name}</h3>
				</div>

				{#if skills.length > 0}
					<div class="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-90">
						{#each skills as s (s)}
							<span class="rounded bg-primary-500/10 px-2 py-0.5">{s}</span>
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
						<span class="opacity-70">Procure Max (Seasonings L20)</span>
						<span class="tabular-nums">{formatNumber(staff.seasoningsMaxLevel20)}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</article>
