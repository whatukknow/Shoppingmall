import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { raw, kits } from '../../domains/products/catalog/catalog';
import { menuDetail } from '../../domains/products/catalog/menu';
import { foodLabel } from '../../shared/lib/food-label';
import {
  localizeProductDetail,
  translateProductText,
} from '../../domains/products/product-copy.en';
const catalog = [...raw, ...kits].map((product) =>
  menuDetail(product.id, null)!,
);

describe('US English product presentation', () => {
  it('covers every customer-facing detail field in the complete source catalog', () => {
    assert.equal(catalog.length, 56);
    for (const source of catalog) {
      const product = localizeProductDetail(source);
      const fields = {
        name: product.name,
        category: product.category,
        unit: product.unit,
        description: product.description,
        farmName: product.farmName,
        farmInfo: product.farmInfo,
        ...product.basicInfo,
        ...Object.fromEntries(
          product.tips.flatMap((tip) => [
            [`${tip.id}.title`, tip.title],
            [`${tip.id}.content`, tip.content],
          ]),
        ),
      };
      for (const [field, text] of Object.entries(fields)) {
        assert.doesNotMatch(
          text,
          /[가-힣]/,
          `${source.id}.${field} needs translation`,
        );
      }
    }
  });

  it('translates every kit ingredient and recipe without changing its linked raw product', () => {
    for (const kit of kits) {
      for (const ingredient of [
        ...kit.includedIngredients,
        ...kit.pantryIngredients,
      ]) {
        assert.doesNotMatch(
          foodLabel(ingredient.name),
          /[가-힣]/,
          ingredient.name,
        );
      }
      for (const step of kit.recipeSteps) {
        assert.doesNotMatch(translateProductText(step), /[가-힣]/, kit.id);
      }
      for (const ingredient of kit.includedIngredients) {
        assert.equal(
          raw.find((p) => p.id === ingredient.productId)?.name,
          ingredient.name,
        );
      }
    }
  });

  it('translates the four bound operational units and farm labels while preserving prices and IDs', () => {
    const fixtures = [
      ['raw-13', 'prd_001', 1900, '사과 1개', '햇살과수원'],
      ['raw-22', 'prd_005', 2900, '복숭아 1개', '햇살과수원'],
      ['raw-21', 'prd_006', 3500, '용과 1개', '햇살과수원'],
      ['raw-24', 'prd_018', 1800, '케일 50g', '초록들농장'],
    ] as const;
    for (const [catalogId, id, price, unit, farmName] of fixtures) {
      const source = {
        ...menuDetail(catalogId, null)!,
        id,
        price,
        unit,
        farmName,
      };
      const result = localizeProductDetail(source);
      assert.equal(result.id, id);
      assert.equal(result.price, price);
      assert.doesNotMatch(result.unit + result.farmName, /[가-힣]/);
    }
  });

  it('preserves commerce fields, image paths, tip identifiers, and source objects', () => {
    for (const source of catalog) {
      const snapshot = structuredClone(source);
      const product = localizeProductDetail(source);
      for (const field of [
        'id',
        'price',
        'discountRate',
        'images',
        'farmImageUrl',
      ] as const) {
        assert.deepEqual(product[field], source[field]);
      }
      assert.deepEqual(
        product.tips.map(({ id }) => id),
        source.tips.map(({ id }) => id),
      );
      assert.deepEqual(source, snapshot);
    }
  });

  it('preserves unknown live copy and empty fields rather than inventing product facts', () => {
    const source = structuredClone(catalog[0]);
    source.farmInfo = '새로 등록된 실제 농장 설명';
    source.basicInfo.shippingInfo = '';
    source.tips = [];
    const product = localizeProductDetail(source);
    assert.equal(product.farmInfo, source.farmInfo);
    assert.equal(product.basicInfo.shippingInfo, '');
    assert.deepEqual(product.tips, []);
    assert.equal(
      translateProductText('Ships in 2 business days.'),
      'Ships in 2 business days.',
    );
  });
});
