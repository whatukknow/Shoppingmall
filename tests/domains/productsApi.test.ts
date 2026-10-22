import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../../shared/lib/client';
import {
  getProductDetail,
  getProducts,
} from '../../domains/products/products.api';

describe('products api (mock)', () => {
  it('returns full list response with 15 items and total', async () => {
    const response = await getProducts();

    assert.equal(response.list.length, 15);
    assert.equal(response.total, 15);
  });

  it('returns product list items with expected field types', async () => {
    const { list } = await getProducts();

    for (const item of list) {
      assert.equal(typeof item.id, 'string');
      assert.equal(typeof item.name, 'string');
      assert.equal(typeof item.imageUrl, 'string');
      assert.equal(typeof item.description, 'string');
      assert.equal(typeof item.category, 'string');
      assert.equal(typeof item.price, 'number');
    }
  });

  it('sorts the list latest first (pc-015 first)', async () => {
    const { list } = await getProducts();

    assert.equal(list[0].id, 'pc-015');
  });

  it('returns product detail for pc-001 with expected field types', async () => {
    const product = await getProductDetail('pc-001');

    assert.equal(typeof product.id, 'string');
    assert.equal(typeof product.name, 'string');
    assert.equal(typeof product.category, 'string');
    assert.ok(Array.isArray(product.images));
    assert.equal(typeof product.farmName, 'string');
    assert.equal(typeof product.price, 'number');
    assert.equal(typeof product.unit, 'string');
    assert.equal(typeof product.discountRate, 'number');
    assert.equal(typeof product.description, 'string');
    assert.equal(typeof product.farmInfo, 'string');
    assert.equal(typeof product.farmImageUrl, 'string');
    assert.equal(typeof product.basicInfo.contentGuide, 'string');
    assert.equal(typeof product.basicInfo.ingredients, 'string');
    assert.equal(typeof product.basicInfo.allergyInfo, 'string');
    assert.equal(typeof product.basicInfo.storageMethod, 'string');
    assert.equal(typeof product.basicInfo.shippingInfo, 'string');
    assert.equal(typeof product.basicInfo.notice, 'string');
    assert.ok(Array.isArray(product.tips));
    assert.equal(product.tips.length, 2);
    for (const tip of product.tips) {
      assert.equal(typeof tip.id, 'string');
      assert.equal(typeof tip.title, 'string');
      assert.equal(typeof tip.content, 'string');
    }
  });

  it('throws ApiError 404 for unknown product id', async () => {
    await assert.rejects(
      () => getProductDetail('pc-999'),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 404);
        return true;
      },
    );
  });
});
