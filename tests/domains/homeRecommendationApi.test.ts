import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getAiRecommendations,
  getRandomRecommendations,
  getRecommendationStatus,
} from '../../domains/home/home.api';
import { MOCK_USER_SCENARIO } from '../../shared/lib/mock/mockScenario';
import { getMe } from '../../domains/auth/users.api';

describe('home recommendation api (mock)', () => {
  it('returns 15 random recommendation products', async () => {
    const products = await getRandomRecommendations();

    assert.equal(products.length, 15);
    for (const product of products) {
      assert.equal(typeof product.id, 'string');
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.imageUrl, 'string');
      assert.ok(product.imageUrl.length > 0);
    }
  });

  it('returns 5 ai recommendation products', async () => {
    const products = await getAiRecommendations();

    assert.equal(products.length, 5);
    for (const product of products) {
      assert.equal(typeof product.id, 'string');
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.imageUrl, 'string');
    }
  });

  it('returns recommendation status based on the user scenario', async () => {
    const expected = {
      guest: { isLoggedIn: false, hasTasteProfile: false },
      ai: { isLoggedIn: true, hasTasteProfile: true },
      'needs-taste': { isLoggedIn: true, hasTasteProfile: false },
    }[MOCK_USER_SCENARIO];

    if (MOCK_USER_SCENARIO === 'guest') {
      // 401 이면 비회원 상태로 반환한다 (throw 하지 않음)
      assert.deepEqual(await getRecommendationStatus(), {
        isLoggedIn: false,
        hasTasteProfile: false,
      });
      return;
    }

    const status = await getRecommendationStatus();

    assert.deepEqual(status, expected);
  });
  it('matches getMe based status for the scenario', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const user = await getMe();
    const status = await getRecommendationStatus();

    assert.equal(status.isLoggedIn, true);
    assert.equal(status.hasTasteProfile, user.hasTasteProfile);
  });
});
