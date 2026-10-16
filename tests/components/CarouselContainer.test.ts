import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'node:test';
import { CarouselContainer } from '../../shared/components/CarouselContainer';

describe('CarouselContainer', () => {
  it('renders the configured number of items and navigation controls', () => {
    const markup = renderToStaticMarkup(
      createElement(CarouselContainer<{ id: string; name: string }>, {
        items: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
          { id: '3', name: 'Product 3' },
          { id: '4', name: 'Product 4' },
        ],
        itemsPerSlide: 3,
        getItemKey: (item) => item.id,
        renderItem: (item) =>
          createElement('article', { 'data-product-id': item.id }, item.name),
      }),
    );

    assert.equal((markup.match(/data-product-id=/g) ?? []).length, 3);
    assert.match(markup, /Product 3/);
    assert.doesNotMatch(markup, /Product 4/);
    assert.match(markup, /aria-label="다음 상품 보기"/);
  });

  it('renders nothing when there are no items', () => {
    const items: { id: string }[] = [];
    const markup = renderToStaticMarkup(
      createElement(CarouselContainer<{ id: string }>, {
        items,
        itemsPerSlide: 3,
        getItemKey: (item) => item.id,
        renderItem: () => null,
      }),
    );

    assert.equal(markup, '');
  });
});
