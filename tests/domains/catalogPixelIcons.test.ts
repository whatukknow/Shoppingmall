import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { raw, kits } from '../../domains/products/catalog/catalog';
import { CY } from '../../domains/home/onboarding/react/pixelEngine';
import { catalogPixelRects } from '../../domains/home/onboarding/react/catalogPixelIcons';
import { PixelIcon } from '../../domains/home/onboarding/react/PixelIcon';

const rectsFor = (name: string) => catalogPixelRects(name) ?? CY.px(name);

describe('취향 찾기 카탈로그 픽셀 연결', () => {
  it('원물34·DIY22의 이름과 ID가 같은 비어 있지 않은20x20 그림으로 연결된다', () => {
    assert.equal(raw.length, 34);
    assert.equal(kits.length, 22);
    const genericKit = CY.px('kit');
    for (const product of [...raw, ...kits]) {
      const named = rectsFor(product.name);
      assert.deepEqual(named, rectsFor(product.id), product.name);
      assert.ok(named.length > 0, product.name);
      assert.notDeepEqual(
        named,
        genericKit,
        `${product.name}: 기본 kit로 대체되면 안 됨`,
      );
      for (const rect of named) {
        assert.ok(rect.x >= 0 && rect.y >= 0, product.name);
        assert.ok(
          rect.x + rect.width <= 20 && rect.y + rect.height <= 20,
          product.name,
        );
        assert.equal(rect.height, 1);
      }
    }
  });

  it('서로 다른 원물34개의 그림은 서로 구별된다', () => {
    const unique = new Set(
      raw.map((product) => JSON.stringify(rectsFor(product.id))),
    );
    assert.equal(unique.size, raw.length);
  });

  it('DIY22는 데이터에 기록된 정확한 원래 sourceName 픽셀을 재사용한다', () => {
    for (const product of kits) {
      assert.ok(CY.names.includes(product.sourceName));
      assert.deepEqual(rectsFor(product.name), CY.px(product.sourceName));
    }
  });

  it('기존 상품명·캐릭터·성향·설문 아이콘은 원본 엔진 결과를 그대로 사용한다', () => {
    const names = [
      ...CY.names,
      'ani:말',
      'ani:토끼',
      'scene:b',
      'scene:p',
      'scene:n',
      'scene:c',
      'fr:empty',
      'fr:sauce',
      'fr:banchan',
      'fr:wilted',
      'sparkle',
      'crystal',
      'el:목',
      'el:금',
    ];
    for (const name of names) {
      assert.equal(catalogPixelRects(name), undefined, name);
      assert.deepEqual(rectsFor(name), CY.px(name));
    }
  });

  it('실제 검증 fixture의 닭다리·닭가슴살·멜론은 서로 다른 픽셀이고 베이글은 원본이다', () => {
    assert.notDeepEqual(rectsFor('닭다리'), rectsFor('닭가슴살'));
    assert.notDeepEqual(rectsFor('머스크멜론'), rectsFor('참외'));
    assert.deepEqual(
      rectsFor('피크닉 베이글 샌드위치'),
      CY.px('피크닉 베이글 샌드위치'),
    );
  });

  it('PixelIcon의 기존 span/svg 계층과 className은 유지하고 사진은 넣지 않는다', () => {
    const html = renderToStaticMarkup(
      createElement(PixelIcon, { name: '머스크멜론', className: 'elb' }),
    );
    assert.match(
      html,
      /^<span class="px elb"><svg viewBox="0 0 20 20" shape-rendering="crispEdges" aria-hidden="true">/,
    );
    assert.match(html, /<rect /);
    assert.doesNotMatch(html, /<img|<image|uploads\//);
  });
});
