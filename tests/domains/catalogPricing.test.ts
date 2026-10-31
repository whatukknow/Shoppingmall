import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/lib/supabase/database.types';
import {
  approvedPriceBindings,
  type PriceRow,
} from '../../domains/products/catalog/pricing';
import { menuList } from '../../domains/products/catalog/menu';
import {
  getMenuProductDetail,
  listMenuProducts,
} from '../../domains/products/catalog/menu.server';
import { formatPrice } from '../../shared/utils/formatPrice';
import proposal from '../../domains/products/data/demo-prices-2026-10-31.json';

const demoRows: PriceRow[] = proposal.products.map((p) => ({
  id: p.confirmed_db_product_id ?? p.catalog_id,
  name: p.name,
  portion_price: p.demo_price_krw,
  is_active: true,
  details: {
    catalogId: p.catalog_id,
    demoPricing: { version: '2026-10-31-v1' },
  },
}));

const approved: PriceRow[] = [
  { id: 'prd_001', name: '사과', portion_price: 1900, is_active: true },
  { id: 'prd_006', name: '용과', portion_price: 3500, is_active: true },
  { id: 'prd_005', name: '복숭아', portion_price: 2900, is_active: true },
  { id: 'prd_018', name: '케일', portion_price: 1800, is_active: true },
];

function client(rows: PriceRow[]) {
  return {
    from(table: string) {
      let id: string | undefined;
      const query = {
        select() {
          return query;
        },
        eq(column: string, value: string) {
          if (column === 'id') id = value;
          return query;
        },
        in() {
          return query;
        },
        order() {
          return query;
        },
        async maybeSingle() {
          return {
            data: rows.find((row) => row.id === id) ?? null,
            error: null,
          };
        },
        then(resolve: (result: unknown) => unknown) {
          return Promise.resolve({
            data: table === 'products' ? rows : [],
            error: null,
          }).then(resolve);
        },
      };
      return query;
    },
  } as unknown as SupabaseClient<Database>;
}

describe('approved catalog pricing', () => {
  it('shows all 56 approved demo prices without changing catalog order or identities', async () => {
    const result = await listMenuProducts({}, client(demoRows));
    assert.equal(result.total, 56);
    assert.deepEqual(
      result.list.map((p) => [p.id, p.name, p.price]),
      proposal.products.map((p) => [p.catalog_id, p.name, p.demo_price_krw]),
    );
  });

  it('requires exact identity and provenance for new demo rows', () => {
    const demo = demoRows.find((p) => p.id === 'diy-09')!;
    assert.equal(approvedPriceBindings([demo])[0].price, 500);
    for (const changed of [
      { ...demo, name: '다른 키트' },
      {
        ...demo,
        details: {
          catalogId: 'diy-08',
          demoPricing: { version: '2026-10-31-v1' },
        },
      },
      {
        ...demo,
        details: {
          catalogId: 'diy-09',
          demoPricing: { version: 'unreviewed' },
        },
      },
      { ...demo, details: null },
    ])
      assert.deepEqual(approvedPriceBindings([changed]), []);
  });

  it('uses every approved demo price on detail URLs and labels it as a sample', async () => {
    for (const expected of proposal.products) {
      const detail = await getMenuProductDetail(
        expected.catalog_id,
        client(demoRows),
      );
      assert.equal(detail?.price, expected.demo_price_krw);
      assert.equal(
        detail?.id,
        expected.confirmed_db_product_id ?? expected.catalog_id,
      );
      assert.equal(detail?.isSample, true);
    }
  });
  it('preserves all 56 products and displays DB prices for exactly four', async () => {
    const result = await listMenuProducts({}, client(approved));
    assert.equal(result.total, 56);
    assert.deepEqual(
      result.list.filter((p) => p.price !== null).map((p) => [p.id, p.price]),
      [
        ['raw-13', 1900],
        ['raw-21', 3500],
        ['raw-22', 2900],
        ['raw-24', 1800],
      ],
    );
    const pending = result.list.filter((p) => p.price === null);
    assert.equal(pending.length, 52);
    for (const product of pending)
      assert.equal(formatPrice(product.price), 'Price to be confirmed');
  });

  it('uses changed DB prices without changing the approved identity', () => {
    const rows = [{ ...approved[0], portion_price: 2300 }];
    assert.equal(
      menuList(approvedPriceBindings(rows)).list.find((p) => p.id === 'raw-13')
        ?.price,
      2300,
    );
  });

  it('rejects unapproved exact names, metadata, canonical IDs and renamed approved rows', () => {
    const rows = [
      {
        id: 'prd_003',
        name: '설향 딸기',
        portion_price: 4500,
        is_active: true,
        details: { catalogId: 'raw-07' },
      },
      { id: 'raw-17', name: '계란', portion_price: 2000, is_active: true },
      { ...approved[0], name: '청사과' },
      { ...approved[0], id: 'other-apple' },
    ];
    assert.deepEqual(approvedPriceBindings(rows), []);
  });

  it('keeps missing, invalid and inactive prices pending', () => {
    for (const price of [
      null,
      0,
      -1,
      1.5,
      NaN,
      Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      assert.equal(
        approvedPriceBindings([{ ...approved[0], portion_price: price }])[0]
          .price,
        null,
      );
    }
    for (const active of [false, null]) {
      assert.equal(
        approvedPriceBindings([{ ...approved[0], is_active: active }])[0].price,
        null,
      );
    }
    assert.equal(
      menuList(approvedPriceBindings([approved[0], approved[0]])).list.find(
        (p) => p.id === 'raw-13',
      )?.price,
      null,
    );
  });

  it('returns identical approved prices and operational IDs on canonical and DB detail URLs', async () => {
    const bindings = approvedPriceBindings(approved);
    for (const binding of bindings) {
      for (const id of [binding.catalogId, binding.productId]) {
        const detail = await getMenuProductDetail(id, client(approved));
        assert.equal(detail?.id, binding.productId);
        assert.equal(detail?.price, binding.price);
        assert.equal(detail?.isPurchasable, true);
      }
    }
  });

  it('keeps unapproved and inactive details pending and unavailable for purchase', async () => {
    const rows = [
      ...approved,
      { id: 'prd_003', name: '딸기', portion_price: 4500, is_active: true },
    ];
    for (const id of ['raw-07', 'diy-09', 'prd_003']) {
      const detail = await getMenuProductDetail(id, client(rows));
      assert.equal(detail?.price, null);
      assert.equal(detail?.isPurchasable, false);
    }
    const inactive = await getMenuProductDetail(
      'prd_001',
      client([{ ...approved[0], is_active: false }]),
    );
    assert.equal(inactive?.price, null);
    assert.equal(inactive?.isPurchasable, false);
    assert.equal(await getMenuProductDetail('missing', client(rows)), null);
  });
});
