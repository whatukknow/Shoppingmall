import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync } from 'node:fs';
import {
  catalogProducts,
  findCatalogProduct,
} from '../../domains/products/catalog/catalog';

describe('removed fried egg catalog product', () => {
  it('does not reintroduce the removed product, image, or mock runtime during integration', () => {
    assert.equal(findCatalogProduct('pc-102'), undefined);
    assert.doesNotMatch(
      JSON.stringify(catalogProducts),
      /pc-102|illustration-fried-egg/,
    );
    assert.equal(existsSync('shared/lib/mock'), false);
    assert.equal(existsSync('domains/payment/data/payment.mock.ts'), false);
  });
});
