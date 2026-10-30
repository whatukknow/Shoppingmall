import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  raw,
  kits,
  catalogImages,
  catalogIdForRow,
} from '../../domains/products/catalog/catalog';
import { menuList, menuDetail } from '../../domains/products/catalog/menu';
import { recommend } from '../../domains/home/onboarding/react/recommendation';

describe('Shared raw / DIY menu', () => {
  it('contains 34 raw products and 22 nonempty kits, all components reference the exact raw item', () => {
    assert.equal(raw.length, 34);
    assert.equal(kits.length, 22);
    for (const k of kits) {
      assert.ok(k.includedIngredients.length);
      for (const i of k.includedIngredients) {
        assert.equal(raw.find((r) => r.id === i.productId)?.name, i.name);
      }
    }
    assert.equal(menuList([]).total, 56);
    assert.ok(!kits.some((k) => k.id === 'diy-20' || k.id === 'diy-22'));
  });
  it('keeps transparent slot 06 in Taste Finder, slots 01–04 in galleries, raw 05 recommendation, kit cutout recommendation, 07 story, 08 catalog', () => {
    for (const r of raw) {
      const images = catalogImages(r.id)!;
      assert.match(images.portion!, /06-portion-package-cutout\.webp$/);
      assert.match(images.catalog, /08-illustration.webp$/);
      assert.match(images.recommendation, /05-/);
      assert.match(images.story, /07-/);
      assert.equal(images.gallery.length, 4);
    }
    for (const k of kits) {
      const images = catalogImages(k.id)!;
      assert.equal(images.gallery.length, 4);
      assert.equal(images.recommendation, k.catalogImage);
      assert.match(images.recommendation, /catalog-cutout/);
      assert.match(images.story, /07-/);
      assert.match(images.catalog, /(08-catalog|00-catalog)/);
      assert.equal(images.portion, undefined);
    }
  });
  it('all 460 catalog assets exist with the recorded bytes and hashes', () => {
    const manifest = JSON.parse(
      readFileSync(
        join(process.cwd(), 'domains/products/data/image-manifest.json'),
        'utf8',
      ),
    );
    assert.equal(Object.keys(manifest).length, 460);
    for (const path of Object.keys(manifest)) {
      assert.ok(existsSync(join(process.cwd(), path)), path);
      const bytes = readFileSync(join(process.cwd(), path));
      assert.equal(bytes.length, manifest[path].bytes, path);
      assert.equal(
        createHash('sha256').update(bytes).digest('hex'),
        manifest[path].sha256,
        path,
      );
    }
  });
  it('maps all 34 reviewed cutouts without replacing the original package or gallery assets', () => {
    const dataRoot = join(process.cwd(), 'domains/products/data');
    const products = JSON.parse(
      readFileSync(join(dataRoot, 'rawProducts.json'), 'utf8'),
    );
    const masks = JSON.parse(
      readFileSync(join(dataRoot, 'portion-cutout-masks.json'), 'utf8'),
    );
    const audit = JSON.parse(
      readFileSync(join(dataRoot, 'portion-cutout-audit.json'), 'utf8'),
    );
    assert.equal(masks.entries.length, 34);
    assert.equal(audit.entries.length, 34);
    assert.equal(
      new Set(masks.entries.map((entry: { id: string }) => entry.id)).size,
      34,
    );
    for (const product of products) {
      const mask = masks.entries.find(
        (entry: { id: string }) => entry.id === product.id,
      );
      const result = audit.entries.find(
        (entry: { id: string }) => entry.id === product.id,
      );
      assert.ok(mask, product.id);
      assert.ok(result, product.id);
      assert.equal(product.tasteFinderImage, `/${mask.output}`);
      assert.equal(product.portionImage, `/${mask.source}`);
      assert.equal(product.galleryImages.length, 4);
      assert.ok(
        product.galleryImages.every((path: string) => !path.includes('cutout')),
      );
      for (const [path, expected] of [
        [mask.source, mask.sourceSha256],
        [mask.output, result.sha256],
      ]) {
        assert.equal(
          createHash('sha256')
            .update(readFileSync(join(process.cwd(), path)))
            .digest('hex'),
          expected,
        );
      }
      assert.equal(result.sourceSha256, mask.sourceSha256);
      assert.equal(result.rgbChangedPixels, 0);
      assert.equal(result.sourceUnchanged, true);
      assert.equal(result.alphaMin, 0);
      assert.equal(result.alphaMax, 255);
    }
  });
  it('does not turn missing prices into free products or reuse ambiguous bindings', () => {
    const binding = {
      catalogId: 'raw-01',
      productId: 'db-melon',
      price: 1234,
      active: true,
    };
    assert.equal(menuList([]).list[0].price, null);
    assert.equal(menuList([binding]).list[0].price, 1234);
    assert.equal(
      menuList([binding, { ...binding, productId: 'other' }]).list[0].price,
      null,
    );
    const draft = menuDetail('raw-01', null)!;
    assert.equal(draft.price, null);
    assert.equal(draft.isPurchasable, false);
  });
  it('uses explicit binding or exact names, never a fuzzy ingredient match', () => {
    assert.equal(catalogIdForRow({ id: 'prd_001', name: '사과' }), 'raw-13');
    assert.equal(catalogIdForRow({ id: 'prd_003', name: '딸기' }), undefined);
    assert.equal(
      catalogIdForRow({
        id: 'db-id',
        name: '다른 이름',
        details: { catalogId: 'raw-07' },
      }),
      'raw-07',
    );
  });
  it('preserves the operational id, price and stock eligibility in a bound detail', () => {
    const fixture = {
      ...menuDetail('raw-13', null)!,
      id: 'prd_001',
      price: 1900,
      unit: '1개',
    };
    const detail = menuDetail('raw-13', fixture, true)!;
    assert.equal(detail.id, 'prd_001');
    assert.equal(detail.catalogId, 'raw-13');
    assert.equal(detail.price, 1900);
    assert.equal(detail.unit, '1개');
    assert.equal(detail.isPurchasable, true);
  });
  it('recommendations across every Sunday/fridge/element choice stay within the shared menu', () => {
    for (let year = 1990; year < 2000; year++)
      for (const sun of ['b', 'p', 'n', 'c'])
        for (const fridge of ['empty', 'sauce', 'banchan', 'wilted']) {
          const r = recommend({
            y: year,
            m: 6,
            d: 15,
            nick: '검증',
            sun,
            fridge,
          });
          assert.ok(kits.some((k) => k.name === r.kit[0]));
          for (const p of r.items)
            assert.ok(
              raw.some((raw) => raw.name === p[0]),
              p[0],
            );
        }
  });
});
