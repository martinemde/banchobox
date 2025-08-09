import { describe, it, expect, vi } from 'vitest';
import { load } from '../../routes/+layout.server.js';

// Minimal JSON fixtures
const dishes = [{ id: 1 }];
const ingredients = [{ id: 1 }];
const parties = [{ id: 1 }];
const partyDishes = [{ id: 1, dishId: 1, partyId: 1 }];

function mkResponse(data: unknown) {
  return { json: async () => data } as Response;
}

describe('+layout.server load', () => {
  it('fetches all static JSON with base-aware urls', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(mkResponse(dishes))
      .mockResolvedValueOnce(mkResponse(ingredients))
      .mockResolvedValueOnce(mkResponse(parties))
      .mockResolvedValueOnce(mkResponse(partyDishes));

    const result = await load({ fetch } as any);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(result.dishes).toEqual(dishes);
    expect(result.ingredients).toEqual(ingredients);
    expect(result.parties).toEqual(parties);
    expect(result.partyDishes).toEqual(partyDishes);
  });
});


