import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getPods } from '../../domains/pods/pods.api';
import { getProducts } from '../../domains/products/products.api';
import { getRandomRecommendations } from '../../domains/home/home.api';
import fetchMock from '../../shared/lib/mock/fetchMock';

describe('home list api (mock)', () => {
  it('returns 10 best pods with summary fields', async () => {
    const pods = await getPods();

    assert.equal(pods.length, 10);
    for (const pod of pods) {
      assert.equal(typeof pod.id, 'string');
      assert.equal(typeof pod.productName, 'string');
      assert.equal(typeof pod.imageUrl, 'string');
      assert.equal(typeof pod.currentCount, 'number');
      assert.equal(typeof pod.targetCount, 'number');
      assert.equal(typeof pod.deadlineLabel, 'string');
      assert.ok(pod.deadlineLabel.length > 0);
    }
  });

  it('returns 15 products for the catalog', async () => {
    const { list, total } = await getProducts();

    assert.equal(list.length, 15);
    assert.equal(total, 15);
    for (const product of list) {
      assert.equal(typeof product.id, 'string');
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.imageUrl, 'string');
      assert.equal(typeof product.description, 'string');
      assert.equal(typeof product.category, 'string');
      assert.equal(typeof product.price, 'number');
    }
  });

  it('distinguishes products?type=random from products?category=all in fetchMock', () => {
    const random = fetchMock('GET', 'products?type=random&limit=15');
    const catalog = fetchMock(
      'GET',
      'products?category=all&sort=latest&limit=15',
    );

    assert.notEqual(random, undefined);
    assert.notEqual(catalog, undefined);
    assert.notEqual(random, catalog);

    const randomJson = JSON.parse(random as string) as {
      data: { list: unknown[] };
    };
    const catalogJson = JSON.parse(catalog as string) as {
      data: { list: unknown[] };
    };
    assert.equal(randomJson.data.list.length, 15);
    assert.equal(catalogJson.data.list.length, 15);
  });

  it('shares list metadata shape with random recommendations', async () => {
    const products = await getRandomRecommendations();
    assert.equal(products.length, 15);
  });
});
