import type { EnrichedParty, Id, EntityBundle } from '../../src/lib/types.js';

export function buildPartiesBundle(parties: EnrichedParty[]): EntityBundle<EnrichedParty> {
  const byId = Object.fromEntries(parties.map((p) => [p.id, p])) as Record<Id, EnrichedParty>;

  const partyFacets: EntityBundle<EnrichedParty>['facets'] = {
    // Placeholders for future party-level facets
  };

  return {
    rows: parties,
    byId,
    facets: partyFacets
  };
}
