import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getProductDetail,
  listProducts,
  listRandomProducts,
} from '../../domains/products/products.server';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ProductRow = Database['public']['Tables']['products']['Row'];
type UploadRow = Database['public']['Tables']['uploads']['Row'];

function product(overrides: Partial<ProductRow> & { id: string }): ProductRow {
  return {
    gid: `gid-${overrides.id}`,
    name: overrides.id,
    product_type: null,
    farm_name: '테스트 농장',
    crop_name: null,
    source_unit: null,
    portion_amount: 1,
    portion_unit: '개',
    portion_label: '1팩',
    portion_price: 10000,
    storage_type: null,
    is_fresh: true,
    details: { summary: '설명' },
    is_active: true,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    category_id: 'c1',
    ...overrides,
  };
}

function upload(overrides: Partial<UploadRow> & { gid: string }): UploadRow {
  return {
    id: `u-${overrides.gid}-${overrides.sort_order ?? 0}`,
    original_name: null,
    extension: null,
    byte_size: null,
    location: 'illustrations/test.png',
    head_img: false,
    sort_order: 0,
    page: 'product',
    external_url: null,
    ...overrides,
  };
}

type Request = {
  table: string;
  select?: string;
  count?: string;
  filters: { op: string; args: unknown[] }[];
  orders: { column: string; ascending: boolean }[];
  range: { from: number; to: number } | null;
  limit?: number;
};

type RowData = unknown;

/** Supabase 쿼리 빌더를 흉내 내는 가짜 클라이언트. requests 에 모든 쿼리 기록 */
function makeFakeClient(
  handlers: (req: Request) => { data: unknown; count?: number },
) {
  const requests: Request[] = [];
  const client = {
    from(table: string) {
      const req: Request = {
        table,
        filters: [],
        orders: [],
        range: null,
      };
      requests.push(req);
      const builder: unknown = {
        select(sel: string, opts?: { count?: string }) {
          req.select = sel;
          req.count = opts?.count;
          return builder;
        },
        eq(column: string, value: unknown) {
          req.filters.push({ op: 'eq', args: [column, value] });
          return builder;
        },
        in(column: string, values: unknown[]) {
          req.filters.push({ op: 'in', args: [column, values] });
          return builder;
        },
        order(column: string, opts?: { ascending?: boolean }) {
          req.orders.push({ column, ascending: opts?.ascending ?? true });
          return builder;
        },
        range(from: number, to: number) {
          req.range = { from, to };
          return builder;
        },
        maybeSingle() {
          return builder;
        },
        then(
          resolve: (r: { data: unknown; count?: number; error: null }) => void,
        ) {
          const result = handlers(req);
          resolve({ data: result.data, count: result.count, error: null });
          return undefined;
        },
      };
      return builder;
    },
  };
  return {
    client: client as unknown as SupabaseClient<Database>,
    requests,
  };
}

describe('products.server listProducts', () => {
  const rows: RowData[] = [
    {
      ...product({ id: 'pc-002', sort_order: 1 }),
      categories: { category: '채소', sort_order: 1 },
    },
    {
      ...product({ id: 'pc-001', sort_order: 2 }),
      categories: { category: '과일', sort_order: 2 },
    },
  ];
  const uploads: RowData[] = [
    upload({ gid: 'gid-pc-001', head_img: true, sort_order: 1 }),
    upload({ gid: 'gid-pc-002', head_img: true, sort_order: 1 }),
    upload({ gid: 'gid-pc-002', head_img: true, sort_order: 2 }),
  ];

  it('페이징 range 와 exact count 로 total 을 채운다', async () => {
    const { client, requests } = makeFakeClient((req) => {
      if (req.table !== 'products') return { data: null };
      return { data: rows, count: 42 };
    });
    const res = await listProducts({ limit: 10, offset: 5 }, client);
    assert.equal(res.total, 42);
    assert.deepEqual(
      res.list.map((x) => x.id),
      ['pc-002', 'pc-001'],
    );
    assert.deepEqual(requests[0].range, { from: 5, to: 14 });
  });

  it('limit 0 이면 range 를 적용하지 않는다(전체)', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: rows, count: 2 } : { data: null },
    );
    await listProducts({ limit: 0, offset: 0 }, client);
    assert.equal(requests[0].range, null);
  });

  it('sort latest 는 created_at 내림차순, 보조 sort_order 오름차순', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: rows, count: 2 } : { data: null },
    );
    void (await listProducts({ sort: 'latest' }, client));
    assert.deepEqual(requests[0].orders, [
      { column: 'created_at', ascending: false },
      { column: 'sort_order', ascending: true },
    ]);
  });

  it('sort asc/desc 는 name 정렬', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: [], count: 0 } : { data: null },
    );
    void (await listProducts({ sort: 'asc' }, client));
    assert.equal(requests[0].orders[0].column, 'name');
    assert.equal(requests[0].orders[0].ascending, true);
  });

  it('category all 외 값은 categories.category 필터를 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: [], count: 0 } : { data: null },
    );
    void (await listProducts({ category: '과일' }, client));
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'eq' &&
          f.args[0] === 'categories.category' &&
          f.args[1] === '과일',
      ),
    );
  });

  it('category all 은 필터 없음', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: [], count: 0 } : { data: null },
    );
    void (await listProducts({ category: 'all' }, client));
    assert.equal(requests[0].filters.length, 0);
  });

  it('select 에 count exact 를 요청하고 실DB count 를 total 로 쓴다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: rows, count: 52 } : { data: null },
    );
    const res = await listProducts({ limit: 3 }, client);
    assert.equal(requests[0].count, 'exact');
    assert.equal(res.total, 52);
    assert.equal(res.list.length, 2); // rows 만큼 반환, total 은 count 에서
  });

  it('count 가 null 이면 rows.length 로 폴백한다', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'products' ? { data: rows } : { data: null },
    );
    const res = await listProducts({ limit: 3 }, client);
    assert.equal(res.total, 2);
  });

  it('카테고리 필터 시 select 는 categories!inner 로 부모 행을 거른다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: [], count: 0 } : { data: null },
    );
    void (await listProducts({ category: '과일', limit: 0 }, client));
    assert.match(
      requests[0].select ?? '',
      /categories!inner\(category, sort_order\)/,
    );
  });

  it('카테고리 필터 없으면 left join select 유지(카테고리 없는 상품 포함)', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'products' ? { data: [], count: 0 } : { data: null },
    );
    void (await listProducts({ category: 'all' }, client));
    assert.equal(requests[0].select, '*, categories(category, sort_order)');
  });

  it('이미지는 uploads 를 gid 한 번에 조회해 대표(head_img) 하나만 매핑', async () => {
    const tables: string[] = [];
    const { client, requests } = makeFakeClient((req) => {
      tables.push(req.table);
      if (req.table === 'uploads') {
        assert.ok(
          (
            req.filters.find((f) => f.op === 'in')?.args[1] as string[]
          ).includes('gid-pc-001'),
        );
        return { data: uploads };
      }
      return { data: rows, count: 2 };
    });
    const res = await listProducts({}, client);
    assert.equal(requests.length, 2);
    assert.equal(res.list[0].imageUrl, '/uploads/illustrations/test.png');
  });
});

describe('products.server listRandomProducts', () => {
  const rows: RowData[] = [
    { ...product({ id: 'a' }), categories: { category: '과일' } },
    { ...product({ id: 'b' }), categories: { category: '과일' } },
    { ...product({ id: 'c' }), categories: { category: '과일' } },
  ];

  it('셔플 전 전체 활성 개수를 total 로 반환한다', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'products' ? { data: rows, count: 52 } : { data: null },
    );
    const res = await listRandomProducts(2, client);
    assert.equal(res.total, 52);
    assert.equal(res.list.length, 2);
  });

  it('활성 조회 후 limit 개를 뽑아 RecommendedProduct 로 반환', async () => {
    const { client, requests } = makeFakeClient((req) => {
      if (req.table === 'products') {
        assert.ok(req.filters.some((f) => f.op === 'eq' && f.args[1] === true));
        return { data: rows };
      }
      return { data: [upload({ gid: 'gid-a', head_img: true })] };
    });
    const res = await listRandomProducts(2, client);
    assert.equal(res.list.length, 2);
    // total 은 셔플 전 전체 활성 개수(동작 변경: picked.length -> rows.length)
    assert.equal(res.total, 3);
    for (const item of res.list) {
      assert.equal(typeof item.id, 'string');
      assert.equal(typeof item.name, 'string');
      assert.equal(typeof item.imageUrl, 'string');
    }
    assert.ok(requests.length >= 2);
  });
});

describe('products.server getProductDetail', () => {
  it('존재하면 상세를 매핑한다(카테고리·이미지 포함)', async () => {
    const { client, requests } = makeFakeClient((req) => {
      if (req.table === 'uploads') {
        return {
          data: [
            upload({
              gid: 'gid-pc-001',
              head_img: true,
              sort_order: 0,
              location: 'illustrations/head.png',
            }),
            upload({
              gid: 'gid-pc-001',
              sort_order: 1,
              location: 'illustrations/page1.png',
            }),
            upload({
              gid: 'gid-pc-001',
              sort_order: 2,
              location: 'illustrations/page2.png',
            }),
          ],
        };
      }
      return {
        data: {
          ...product({ id: 'pc-001' }),
          categories: { category: '과일' },
        },
      };
    });
    const detail = await getProductDetail('pc-001', client);
    assert.ok(detail);
    assert.equal(detail.id, 'pc-001');
    assert.equal(detail.category, '과일');
    assert.equal(detail.farmImageUrl, '/uploads/illustrations/head.png');
    assert.ok(detail.images.length >= 2);
    // 대표 이미지가 맨 앞, 상세 이미지는 sort_order 순
    assert.deepEqual(detail.images, [
      '/uploads/illustrations/head.png',
      '/uploads/illustrations/page1.png',
      '/uploads/illustrations/page2.png',
    ]);
    // 상세 이미지 조회는 page='product' 필터 포함
    assert.ok(
      requests
        .filter((r) => r.table === 'uploads')
        .some((r) =>
          r.filters.some((f) => f.op === 'eq' && f.args[0] === 'page'),
        ),
    );
  });

  it('없으면 null 을 반환한다', async () => {
    const { client } = makeFakeClient(() => ({ data: null }));
    const detail = await getProductDetail('nope', client);
    assert.equal(detail, null);
  });
});
