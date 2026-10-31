import assert from 'node:assert/strict';
import { it } from 'node:test';
import { podCutoutImage } from '../../domains/products/catalog/pod-images';
import { raw } from '../../domains/products/catalog/catalog';

it('resolves legacy exact apple identity and preserves unknown or ambiguous product fallback', () => {
  assert.equal(
    podCutoutImage('prd_001', '사과', '/old.jpg'),
    raw.find((p) => p.id === 'raw-13')!.tasteFinderImage,
  );
  assert.equal(podCutoutImage('prd_003', '딸기', '/old.jpg'), '/old.jpg');
  assert.equal(podCutoutImage('unknown', '새 상품'), '');
});
