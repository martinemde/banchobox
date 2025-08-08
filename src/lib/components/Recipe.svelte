<script lang="ts">
  import type { EnrichedDish } from '../types.js';
  import { Data } from '../data/runtime.js';
  import { imageUrlForName } from '../images/index.js';

  export let dish: EnrichedDish;

  $: imageSrc = imageUrlForName(dish.name);

  $: ingredientRows = dish.ingredients.map((ing) => {
    const meta = Data.getIngredientById(ing.ingredientId);
    return {
      name: meta?.name ?? 'Unknown',
      count: ing.count,
      upgradeCount: ing.upgradeCount ?? null,
      unitCost: ing.unitCost ?? null,
      lineCost: ing.lineCost,
      type: meta?.type ?? meta?.source ?? '—'
    };
  });

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  // Build rows for all parties associated to this dish, sorted by profit desc
  $: partyRows = (dish.partyDishIds || [])
    .map((id) => Data.getPartyDishById(id))
    .filter(Boolean)
    .map((pd) => ({ partyDish: pd!, party: Data.getPartyById(pd!.partyId) }))
    .sort((a, b) => b.partyDish.profit - a.partyDish.profit);
</script>

<article class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-y divide-surface-200-800">
  <!-- Section 1: Overview -->
  <section class="flex items-center gap-4 p-4">
    <div class="size-16 rounded bg-surface-300-700 grid place-items-center overflow-hidden" aria-hidden="true">
      {#if imageSrc}
        <img src={imageSrc} alt="" loading="lazy" class="size-full object-contain" />
      {/if}
    </div>
    <div class="flex-1">
      <h3 class="h5 m-0">{dish.name}</h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs opacity-70">{dish.unlock_condition || '—'}</span>
        {#if dish.dlc}
          <span class="badge preset-outlined-tertiary-500 text-xs">{dish.dlc}</span>
        {/if}
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 ml-auto text-right">
      <div>
        <div class="text-xs opacity-70">Max Level</div>
        <div class="font-semibold">{dish.final_level}</div>
      </div>
      <div>
        <div class="text-xs opacity-70">Taste</div>
        <div class="font-semibold">{dish.final_taste}</div>
      </div>
      <div>
        <div class="text-xs opacity-70">Price</div>
        <div class="font-semibold">{formatNumber(dish.initial_price)} → {formatNumber(dish.final_price)}</div>
      </div>
      <div>
        <div class="text-xs opacity-70">Serves</div>
        <div class="font-semibold">{dish.servings}</div>
      </div>
    </div>
  </section>

  <!-- Section 2: Recipe -->
  <section class="p-4">
    <h4 class="text-xs uppercase tracking-wide opacity-80 mb-2">Recipe</h4>
    <div class="overflow-x-auto">
      <table class="w-full table-auto text-sm">
        <thead class="bg-surface-200-800">
          <tr>
            <th class="p-2 text-left">Ingredient</th>
            <th class="p-2 text-center">Qty / Dish</th>
            <th class="p-2 text-center">Upgrade</th>
            <th class="p-2 text-right">Cost</th>
            <th class="p-2 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {#each ingredientRows as row}
            <tr class="border-b border-surface-200-800">
              <td class="p-2">{row.name}</td>
              <td class="p-2 text-center tabular-nums">{row.count}</td>
              <td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
              <td class="p-2 text-right tabular-nums">{formatNumber(row.unitCost)}</td>
              <td class="p-2">{row.type}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="bg-surface-200-800 font-semibold">
            <td class="p-2 uppercase text-xs">Recipe Cost</td>
            <td class="p-2 text-center tabular-nums">{dish.ingredientCount}</td>
            <td class="p-2 text-center tabular-nums">{formatNumber(dish.upgradeCost)}</td>
            <td class="p-2 text-right tabular-nums">{formatNumber(dish.recipeCost)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>

  <!-- Section 3: Parties -->
  {#if dish.partyDishIds && dish.partyDishIds.length > 0}
    <section class="p-4">
      <h4 class="text-xs uppercase tracking-wide opacity-80 mb-2">Parties</h4>
      <div class="overflow-x-auto">
        <table class="w-full table-auto text-sm">
          <thead class="bg-surface-200-800">
            <tr>
              <th class="p-2 text-left">Party</th>
              <th class="p-2 text-center">Bonus</th>
              <th class="p-2 text-right">Final Price</th>
              <th class="p-2 text-right">Revenue (×Servings)</th>
            </tr>
          </thead>
          <tbody>
            {#each partyRows as row}
              <tr class="border-b border-surface-200-800">
                <td class="p-2">{row.party?.name ?? '—'}</td>
                <td class="p-2 text-center">{row.party ? `${row.party.bonus}×` : '—'}</td>
                <td class="p-2 text-right tabular-nums">{formatNumber(row.partyDish.partyPrice)}</td>
                <td class="p-2 text-right tabular-nums">{formatNumber(row.partyDish.partyRevenue)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}
</article>
