import type { EnrichedParty, PartyDish, Id } from '../../src/lib/types.js';

export type Facets = Record<string, Record<string, Id[]>>;

export function buildPartiesBundle(parties: EnrichedParty[], partyDishes: PartyDish[]) {
  const byId = Object.fromEntries(parties.map((p) => [p.id, p])) as Record<Id, EnrichedParty>;

  const pdByParty = new Map<Id, PartyDish[]>();
  for (const pd of partyDishes) {
    if (!pdByParty.has(pd.partyId)) pdByParty.set(pd.partyId, []);
    pdByParty.get(pd.partyId)!.push(pd);
  }

  const dishesByParty: Record<Id, { rows: PartyDish[]; byId: Record<Id, PartyDish>; facets: Facets }> = {};

  for (const party of parties) {
    const rows = (pdByParty.get(party.id) ?? []).sort(
      (a, b) => (b.sort.profitPerServing as number) - (a.sort.profitPerServing as number)
    );
    const byIdPD = Object.fromEntries(rows.map((r) => [r.id, r])) as Record<Id, PartyDish>;
    const facets: Facets = { dlc: {}, unlock: {} };
    for (const r of rows) {
      const dlc = (r.dlc ?? 'base').toString();
      (facets.dlc[dlc] ??= []).push(r.id);
      const unlock = (r.unlock ?? '').toString();
      if (unlock) (facets.unlock[unlock] ??= []).push(r.id);
    }
    dishesByParty[party.id] = { rows, byId: byIdPD, facets };
  }

  const partyFacets: Facets = {};

  return {
    rows: parties,
    byId,
    facets: partyFacets,
    dishesByParty,
  };
}
