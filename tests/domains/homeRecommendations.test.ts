import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HomeProduct } from '../../domains/home/data/homeProducts';

const shareProducts: HomeProduct[] = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  name: `product-${index}`,
  description: '',
  illustration: index === 15 ? 'apple' : 'melon',
}));
import { resolveHomeRecommendations } from '../../domains/home/data/homeRecommendations';

describe('resolveHomeRecommendations', () => {
  it('finds onboarding selections outside the guest random list', () => {
    const guestProducts = shareProducts.slice(0, 15);
    const selectedProduct = shareProducts.find(
      (product) => !guestProducts.includes(product),
    );

    assert.ok(selectedProduct);
    assert.equal(guestProducts.includes(selectedProduct), false);

    const recommendations = resolveHomeRecommendations(
      JSON.stringify([selectedProduct.illustration]),
      shareProducts,
    );

    assert.deepEqual(recommendations, [selectedProduct]);
  });
});
