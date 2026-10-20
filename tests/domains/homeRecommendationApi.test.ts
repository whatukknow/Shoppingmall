import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getAiRecommendations,
  getRandomRecommendations,
  getRecommendationStatus,
} from '../../domains/home/home.api';
import { HOME_RECOMMENDATION_MOCK_SCENARIO } from '../../shared/lib/mock/datas/home.mock';

describe('home recommendation api (mock)', () => {
  it('returns 15 random recommendation products', async () => {
    const products = await getRandomRecommendations();

    assert.equal(products.length, 15);
    for (const product of products) {
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.description, 'string');
    }
  });

  it('returns 5 ai recommendation products', async () => {
    const products = await getAiRecommendations();

    assert.equal(products.length, 5);
    for (const product of products) {
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.description, 'string');
    }
  });

  it('returns recommendation status matching the mock scenario', async () => {
    const status = await getRecommendationStatus();
    const expected = {
      guest: { isLoggedIn: false, hasTasteProfile: false },
      ai: { isLoggedIn: true, hasTasteProfile: true },
      'needs-taste': { isLoggedIn: true, hasTasteProfile: false },
    }[HOME_RECOMMENDATION_MOCK_SCENARIO];

    assert.deepEqual(status, expected);
  });
});
