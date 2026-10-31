import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { foodLabel } from '../../shared/lib/food-label';

describe('English operational product labels', () => {
  it('translates legacy aliases without changing canonical source identifiers', () => {
    const source = [
      '체리',
      '청사과',
      '바질 페스토',
      '버섯 크림 파스타 키트',
      '홈 포카치아 키트',
    ];
    assert.deepEqual(source.map(foodLabel), [
      'Cherries',
      'Green apples',
      'Basil pesto',
      'Creamy mushroom pasta kit',
      'Bake-at-home focaccia kit',
    ]);
    assert.equal(source[0], '체리');
  });
  it('translates portion units, approximation, fractions and singular counts', () => {
    assert.equal(foodLabel('1개(약 300g)'), '1 piece(approx. 300g)');
    assert.equal(foodLabel('귤 300g'), 'Mandarins 300g');
    assert.equal(foodLabel('알배추 1/2포기'), 'Baby napa cabbage 1/2 head');
    assert.equal(foodLabel('치즈 4장'), 'Cheese 4 slices');
    assert.equal(foodLabel('팽이버섯 1봉'), 'Enoki mushrooms 1 bag');
    assert.equal(foodLabel('1인분 키트'), '1 serving kit');
    assert.equal(
      foodLabel('기존 레시피 1회분의 포함 재료만'),
      'Included ingredients for one recipe batch',
    );
  });
  it('does not rewrite element keys or plain product IDs', () => {
    assert.equal(foodLabel('raw-01'), 'raw-01');
    assert.equal(foodLabel('목'), 'Wood');
    assert.equal(foodLabel('목 unknown'), '목 unknown');
  });
});
