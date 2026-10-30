import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LivePodSection from '../../domains/product-detail/components/LivePodSection';
import { CatalogTasteImage } from '../../domains/home/onboarding/react/CatalogTasteImage';

describe('catalog presentation boundaries', () => {
  it('keeps draft catalog IDs out of buying-group navigation', () => {
    const draft = renderToStaticMarkup(
      createElement(LivePodSection, {
        productId: 'diy-01',
        pods: [],
        allowBrowse: false,
      }),
    );
    assert.doesNotMatch(draft, /href=/);
    const active = renderToStaticMarkup(
      createElement(LivePodSection, {
        productId: 'prd_001',
        pods: [],
        allowBrowse: true,
      }),
    );
    assert.match(active, /href="\/pods\/product\/prd_001"/);
  });

  it('renders raw Taste Finder slot 06 with English alt and tooltip text', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogTasteImage, {
        name: '케일',
        title: '케일',
      }),
    );
    assert.match(html, /06-portion-package/);
    assert.match(html, /title="Kale"/);
    assert.match(html, /Kale — portion image concept/);
    assert.doesNotMatch(html, /[가-힣]/);
  });
});
