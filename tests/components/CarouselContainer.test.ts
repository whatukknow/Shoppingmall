import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CarouselContainer } from '../../shared/components/CarouselContainer';

describe('CarouselContainer', () => {
  it('renders only the first slide and provides navigation controls', () => {
    const html = renderToStaticMarkup(
      createElement(CarouselContainer, {
        items: ['first', 'second', 'third', 'fourth'],
        itemsPerSlide: 3,
        getItemKey: (item) => item,
        renderItem: (item) => createElement('p', null, item),
      }),
    );

    assert.match(html, /first/);
    assert.match(html, /second/);
    assert.match(html, /third/);
    assert.doesNotMatch(html, /fourth/);
    assert.match(html, /aria-label="다음 상품"/);
    assert.match(html, />1 \/ 2</);
  });

  it('renders an empty collection without failing', () => {
    const html = renderToStaticMarkup(
      createElement(CarouselContainer, {
        items: [],
        itemsPerSlide: 3,
        getItemKey: (item: string) => item,
        renderItem: (item: string) => createElement('p', null, item),
      }),
    );

    assert.match(html, />0 \/ 0</);
  });
});
