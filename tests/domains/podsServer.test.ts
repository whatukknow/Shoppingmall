import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listPods, listProductPods } from '../../domains/pods/pods.server';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { raw, kits } from '../../domains/products/catalog/catalog';

type PodRow = Database['public']['Tables']['pods']['Row'];
type UploadRow = Database['public']['Tables']['uploads']['Row'];

describe('buying-group cutout image mapping', () => {
  it('uses raw06 for every crop and existing cutouts for all DIY kits', async () => {
    for (const item of [...raw, ...kits]) {
      const row = {
        ...pod({ id: `group-${item.id}`, product_id: item.id }),
        products: { name: item.name, gid: null },
      };
      const { client } = makeFakeClient((req) => ({
        data: req.table === 'pods' ? [row] : [],
        count: 1,
      }));
      const result = await listProductPods(item.id, {}, client);
      const expected =
        'tasteFinderImage' in item ? item.tasteFinderImage : item.catalogImage;
      assert.equal(result.list[0].imageUrl, expected, item.id);
    }
  });
});

function pod(overrides: Partial<PodRow> & { id: string }): PodRow {
  return {
    pod_no: 1,
    capacity: 4,
    recruit_deadline_date: null,
    recruit_deadline: '2026-02-01T00:00:00Z',
    portion_label: '1팩',
    member_count: 2,
    status: 'recruiting',
    matched_at: null,
    payment_due_at: null,
    confirmed_at: null,
    cancelled_at: null,
    cancel_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    product_id: 'pc-001',
    ...overrides,
  };
}

function upload(overrides: Partial<UploadRow> & { gid: string }): UploadRow {
  return {
    id: `u-${overrides.gid}-${overrides.sort_order ?? 0}`,
    original_name: null,
    extension: null,
    byte_size: null,
    location: 'images/test.png',
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
};

/** Supabase 쿼리 빌더를 흉내 내는 가짜 클라이언트. requests 에 모든 쿼리 기록 */
function makeFakeClient(
  handlers: (req: Request) => { data: unknown; count?: number },
  auth?: { id: string },
) {
  /** supabase-js PostgrestFilterBuilder 실제 메서드 목록 — 이 외 메서드 호출 시 throw */
  const allowedBuilderMethods = new Set([
    'select',
    'eq',
    'neq',
    'in',
    'order',
    'range',
    'limit',
    'single',
    'maybeSingle',
    'then',
  ]);
  const requests: Request[] = [];
  const client = {
    from(table: string) {
      const req: Request = { table, filters: [], orders: [], range: null };
      requests.push(req);
      // 기록 대상 메서드만 노출하고, 나머지 키 접근은 즉시 throw (오타·존재하지 않는 메서드 감지)
      const builder: unknown = new Proxy(
        {
          select(sel: string, opts?: { count?: string }) {
            req.select = sel;
            req.count = opts?.count;
            return builder;
          },
          eq(column: string, value: unknown) {
            if (req.orders.length > 0 || req.range) {
              throw new Error(
                `가짜 클라이언트: order/range 이후 eq 필터 호출 금지 (@${req.table})`,
              );
            }
            req.filters.push({ op: 'eq', args: [column, value] });
            return builder;
          },
          neq(column: string, value: unknown) {
            if (req.orders.length > 0 || req.range) {
              throw new Error(
                `가짜 클라이언트: order/range 이후 neq 필터 호출 금지 (@${req.table})`,
              );
            }
            req.filters.push({ op: 'neq', args: [column, value] });
            return builder;
          },
          in(column: string, values: unknown[]) {
            if (req.orders.length > 0 || req.range) {
              throw new Error(
                `가짜 클라이언트: order/range 이후 in 필터 호출 금지 (@${req.table})`,
              );
            }
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
            resolve: (r: {
              data: unknown;
              count?: number;
              error: null;
            }) => void,
          ) {
            const result = handlers(req);
            resolve({ data: result.data, count: result.count, error: null });
            return undefined;
          },
        },
        {
          get(target, prop) {
            if (
              typeof prop === 'symbol' ||
              !allowedBuilderMethods.has(String(prop))
            ) {
              throw new TypeError(
                `가짜 클라이언트: supabase-js 빌더에 없는 메서드/속성 호출: ${String(prop)} (@${req.table})`,
              );
            }
            return target[prop as keyof typeof target];
          },
        },
      );
      return builder;
    },
    auth: auth
      ? {
          getUser: async () => ({
            data: { user: { id: auth.id } },
            error: null,
          }),
        }
      : undefined,
  };
  return {
    client: client as unknown as SupabaseClient<Database>,
    requests,
  };
}

const joinedPods: (PodRow & {
  products: { name: string; gid: string } | null;
})[] = [
  {
    ...pod({ id: 'pod-1', product_id: 'pc-001', member_count: 4, capacity: 4 }),
    products: { name: '참외', gid: 'gid-pc-001' },
  },
  {
    ...pod({
      id: 'pod-2',
      product_id: 'pc-002',
      member_count: 1,
      capacity: 4,
      recruit_deadline: '2026-01-20T00:00:00Z',
    }),
    products: { name: '토마토', gid: 'gid-pc-002' },
  },
  {
    ...pod({
      id: 'pod-3',
      product_id: 'pc-003',
      member_count: 2,
      capacity: 6,
      status: 'matched',
    }),
    products: { name: '멜론', gid: 'gid-pc-003' },
  },
];

const uploads: UploadRow[] = [
  upload({ gid: 'gid-pc-001', head_img: true, sort_order: 1 }),
  upload({ gid: 'gid-pc-002', head_img: true, sort_order: 1 }),
];

describe('pods.server listPods', () => {
  it('status open 은 recruiting eq 필터를 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: joinedPods, count: 3 } : { data: null },
    );
    await listPods({ status: 'open' }, client);
    const filters = requests[0].filters.filter((f) => f.op !== undefined);
    assert.ok(
      filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'status' && f.args[1] === 'recruiting',
      ),
    );
  });

  it('status close 는 recruiting neq 필터를 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: joinedPods, count: 3 } : { data: null },
    );
    await listPods({ status: 'close' }, client);
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'neq' &&
          f.args[0] === 'status' &&
          f.args[1] === 'recruiting',
      ),
    );
  });

  it('status close + sort asc 는 필터를 order/range 보다 먼저 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: [], count: 0 } : { data: uploads },
    );
    await listPods({ status: 'close', sort: 'asc', limit: 2 }, client);
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'neq' &&
          f.args[0] === 'status' &&
          f.args[1] === 'recruiting',
      ),
    );
    assert.deepEqual(requests[0].orders, [
      { column: 'recruit_deadline', ascending: true },
    ]);
    assert.deepEqual(requests[0].range, { from: 0, to: 1 });
  });

  it('sort best 는 모집률(member_count/capacity) 내림·동률 recruit_deadline 오름 서버 정렬 후 limit 적용', async () => {
    // cap 4: pod-1 4/4=1.0, pod-2 1/4=0.25 → best 순서 pod-1, pod-2
    const rows = joinedPods.filter((r) => r.status === 'recruiting');
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods'
        ? { data: rows, count: 2 }
        : req.table === 'uploads'
          ? { data: uploads }
          : { data: null },
    );
    const res = await listPods(
      { status: 'open', sort: 'best', limit: 2 },
      client,
    );
    assert.deepEqual(
      res.list.map((x) => x.id),
      ['pod-1', 'pod-2'],
    );
    assert.equal(res.total, 2);
    // 비율 정렬은 DB 정렬 불가 — 정렬 후 limit 이므로 pods query 에 range 없음
    assert.equal(requests[0].range, null);
  });

  it('sort asc/desc 는 recruit_deadline DB 정렬', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: [], count: 0 } : { data: uploads },
    );
    await listPods({ sort: 'asc' }, client);
    assert.deepEqual(requests[0].orders, [
      { column: 'recruit_deadline', ascending: true },
    ]);
    void (await listPods({ sort: 'desc' }, client));
    assert.deepEqual(requests[1].orders, [
      { column: 'recruit_deadline', ascending: false },
    ]);
  });

  it('asc/desc 정렬은 DB range 를 적용한다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: [], count: 0 } : { data: uploads },
    );
    await listPods({ sort: 'asc', limit: 10 }, client);
    assert.deepEqual(requests[0].range, { from: 0, to: 9 });
  });

  it('상품명·이미지는 조인 rows 와 uploads 일괄 조회(쿼리 2회)로 매핑한다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods'
        ? { data: joinedPods, count: 3 }
        : req.table === 'uploads'
          ? { data: uploads }
          : { data: null },
    );
    const res = await listPods({ sort: 'best', limit: 0 }, client);
    assert.equal(requests.length, 2); // pods + uploads (N+1 아님)
    assert.match(requests[0].select ?? '', /products\(name, gid\)/);
    assert.equal(res.list[0].productName, '참외');
    assert.equal(res.list[0].imageUrl, '/uploads/images/test.png');
    assert.equal(res.list[0].currentCount, 4);
    assert.equal(res.list[0].targetCount, 4);
  });

  it('count exact 를 요청하고 count 를 total 로 쓴다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods'
        ? { data: joinedPods, count: 52 }
        : { data: uploads },
    );
    const res = await listPods({ limit: 3 }, client);
    assert.equal(requests[0].count, 'exact');
    assert.equal(res.total, 52);
  });
});

describe('pods.server listProductPods', () => {
  const detailRows: (PodRow & {
    products: { name: string; gid: string } | null;
    // DB 가 pod_no asc 로 정렬해 돌려주는 상황을 재현한 순서
  })[] = [
    {
      ...pod({
        id: 'pod-b',
        product_id: 'pc-001',
        pod_no: 1,
        status: 'matched',
      }),
      products: { name: '참외', gid: 'gid-pc-001' },
    },
    {
      ...pod({ id: 'pod-a', product_id: 'pc-001', pod_no: 2 }),
      products: { name: '참외', gid: 'gid-pc-001' },
    },
  ];

  it('status all 은 status 필터 없음, open/close 는 필터를 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: detailRows, count: 2 } : { data: uploads },
    );
    const podReq = () => requests.filter((r) => r.table === 'pods');
    await listProductPods('pc-001', { status: 'all' }, client);
    assert.equal(
      podReq()[0].filters.filter((f) => f.args[0] !== 'product_id').length,
      0,
    );
    await listProductPods('pc-001', { status: 'open' }, client);
    assert.ok(
      podReq()[1].filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'status' && f.args[1] === 'recruiting',
      ),
    );
    await listProductPods('pc-001', { status: 'close' }, client);
    assert.ok(
      podReq()[2].filters.some(
        (f) =>
          f.op === 'neq' &&
          f.args[0] === 'status' &&
          f.args[1] === 'recruiting',
      ),
    );
  });

  it('productId 는 eq(product_id) 필터로 건다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: detailRows, count: 2 } : { data: uploads },
    );
    await listProductPods('pc-001', {}, client);
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'product_id' && f.args[1] === 'pc-001',
      ),
    );
  });

  it('sort deadline 은 recruit_deadline asc, asc/desc 는 pod_no 정렬', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: detailRows, count: 2 } : { data: uploads },
    );
    const podReq = () => requests.filter((r) => r.table === 'pods');
    await listProductPods('pc-001', { sort: 'deadline' }, client);
    assert.deepEqual(podReq()[0].orders, [
      { column: 'recruit_deadline', ascending: true },
    ]);
    await listProductPods('pc-001', { sort: 'asc' }, client);
    assert.deepEqual(podReq()[1].orders, [
      { column: 'pod_no', ascending: true },
    ]);
    await listProductPods('pc-001', { sort: 'desc' }, client);
    assert.deepEqual(podReq()[2].orders, [
      { column: 'pod_no', ascending: false },
    ]);
  });

  it('페이징 range 와 total 을 채운다', async () => {
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'pods'
        ? { data: detailRows, count: 42 }
        : { data: uploads },
    );
    const res = await listProductPods(
      'pc-001',
      { status: 'all', limit: 10, offset: 5 },
      client,
    );
    assert.deepEqual(requests[0].range, { from: 5, to: 14 });
    assert.equal(res.total, 42);
    assert.equal(res.list.length, 2);
    assert.equal(res.limit, 10);
    assert.equal(res.offset, 5);
  });

  it('optionLabel·상태·마감 라벨을 매핑한다', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'pods' ? { data: detailRows, count: 2 } : { data: uploads },
    );
    const res = await listProductPods('pc-001', { sort: 'asc' }, client);
    // pod_no asc: pod-b(1), pod-a(2)
    assert.equal(res.list[0].id, 'pod-b');
    assert.equal(res.list[0].optionLabel, '1팩');
    assert.equal(res.list[0].status, 'close');
    assert.equal(res.list[1].status, 'open');
    assert.equal(res.list[1].productName, '참외');
  });

  describe('세션 사용자 참여 반영', () => {
    const createdRows: (PodRow & {
      products: { name: string; gid: string } | null;
    })[] = [
      // DB 가 pod_no asc 로 돌려주는 상황 재현 — created_at 은 각각 다름
      {
        ...pod({
          id: 'pod-early',
          product_id: 'pc-001',
          pod_no: 1,
          created_at: '2026-01-05T00:00:00Z',
        }),
        products: { name: '참외', gid: 'gid-pc-001' },
      },
      {
        ...pod({
          id: 'pod-mid',
          product_id: 'pc-001',
          pod_no: 2,
          created_at: '2026-01-10T00:00:00Z',
        }),
        products: { name: '참외', gid: 'gid-pc-001' },
      },
      {
        ...pod({
          id: 'pod-late',
          product_id: 'pc-001',
          pod_no: 3,
          created_at: '2026-01-15T00:00:00Z',
        }),
        products: { name: '참외', gid: 'gid-pc-001' },
      },
    ];

    function participantRows(podIds: string[]) {
      return podIds.map((pid, i) => ({
        id: 100 + i,
        status: 'accepted',
        is_active: true,
        refund_required: null,
        applied_at: null,
        payment_ready_at: null,
        paid_at: null,
        cancelled_at: null,
        ended_at: null,
        product_id: 'pc-001',
        pod_id: pid,
        application_id: i + 1,
        paid_order_id: null,
        profile_id: 'u-1',
      }));
    }

    it('내가 참여한 팟은 isJoined true, created_at 최신순으로 맨 앞에 온다 (비참여는 기존 정렬 유지)', async () => {
      const { client, requests } = makeFakeClient(
        (req) =>
          req.table === 'pod_participants'
            ? { data: participantRows(['pod-early', 'pod-late']) }
            : req.table === 'pods'
              ? { data: createdRows, count: createdRows.length }
              : { data: uploads },
        { id: 'u-1' },
      );
      const res = await listProductPods('pc-001', { sort: 'asc' }, client);
      // 참여: created_at 최신순 pod-late(01-15) → pod-early(01-05), 나머지 pod-mid
      assert.deepEqual(
        res.list.map((x) => x.id),
        ['pod-late', 'pod-early', 'pod-mid'],
      );
      assert.deepEqual(
        res.list.map((x) => x.isJoined),
        [true, true, false],
      );
      // 참여 조회: 내 profile + 해당 상품 + 활성
      const partReq = requests.find((r) => r.table === 'pod_participants');
      assert.ok(partReq);
      const filt = (col: string) =>
        partReq.filters.some(
          (f) => f.op === 'eq' && f.args[0] === col && f.args[1] !== undefined,
        );
      assert.ok(filt('profile_id'));
      assert.ok(filt('product_id'));
      assert.ok(filt('is_active'));
      const uidFilter = partReq.filters.find(
        (f) => f.op === 'eq' && f.args[0] === 'profile_id',
      );
      assert.equal(uidFilter?.args[1], 'u-1');
    });

    it('비로그인(세션 없음)이면 참여 조회 없이 기존 순서 그대로', async () => {
      const { client, requests } = makeFakeClient((req) =>
        req.table === 'pods'
          ? { data: createdRows, count: createdRows.length }
          : { data: uploads },
      );
      const res = await listProductPods('pc-001', { sort: 'asc' }, client);
      assert.deepEqual(
        res.list.map((x) => x.id),
        ['pod-early', 'pod-mid', 'pod-late'],
      );
      assert.deepEqual(
        res.list.map((x) => x.isJoined ?? false),
        [false, false, false],
      );
      assert.ok(!requests.some((r) => r.table === 'pod_participants'));
    });

    it('내가 참여한 팟이 is_active=false (취소됨) 면 참여로 보지 않는다', async () => {
      const cancelled = participantRows(['pod-late']).map((r) => ({
        ...r,
        is_active: false,
      }));
      const { client } = makeFakeClient(
        (req) =>
          req.table === 'pod_participants'
            ? {
                // DB is_active eq 필터를 존중한 결과를 재현
                data: req.filters.some(
                  (f) =>
                    f.op === 'eq' &&
                    f.args[0] === 'is_active' &&
                    f.args[1] === true,
                )
                  ? []
                  : cancelled,
              }
            : req.table === 'pods'
              ? { data: createdRows, count: createdRows.length }
              : { data: uploads },
        { id: 'u-1' },
      );
      const res = await listProductPods('pc-001', { sort: 'asc' }, client);
      assert.deepEqual(
        res.list.map((x) => x.id),
        ['pod-early', 'pod-mid', 'pod-late'],
      );
      assert.ok(!res.list.some((x) => x.isJoined === true));
    });

    it('첫 페이지에 참여 팟이 limit 밖이어도 맨 앞에 포함, total 은 기존 count 유지', async () => {
      const pageRows = createdRows.slice(0, 2);
      const { client, requests } = makeFakeClient(
        (req) =>
          req.table === 'pod_participants'
            ? { data: participantRows(['pod-late']) }
            : req.table === 'pods' && req.range
              ? { data: pageRows, count: 42 }
              : req.table === 'pods'
                ? { data: [createdRows[2]] }
                : { data: uploads },
        { id: 'u-1' },
      );
      const res = await listProductPods('pc-001', { limit: 2 }, client);
      assert.deepEqual(
        res.list.map((x) => x.id),
        ['pod-late', 'pod-early', 'pod-mid'],
      );
      assert.equal(res.total, 42);
      // 밖의 참여 팟은 in(id) 재조회로 가져온다
      const podsReqs = requests.filter((r) => r.table === 'pods');
      assert.equal(podsReqs.length, 2);
      const inFilter = podsReqs[1].filters.find((f) => f.op === 'in');
      assert.ok(inFilter);
      assert.deepEqual(inFilter.args, ['id', ['pod-late']]);
      // 재조회에도 동일 status 필터 적용
      assert.equal(podsReqs[1].range, null);
    });

    it('offset 0 밖 참여 팟 재조회에도 status 필터를 동일 적용한다', async () => {
      const { client, requests } = makeFakeClient(
        (req) =>
          req.table === 'pod_participants'
            ? { data: participantRows(['pod-late']) }
            : req.table === 'pods' && req.range
              ? { data: createdRows.slice(0, 2), count: 42 }
              : req.table === 'pods'
                ? { data: [] }
                : { data: uploads },
        { id: 'u-1' },
      );
      await listProductPods('pc-001', { status: 'open', limit: 2 }, client);
      const podsReqs = requests.filter((r) => r.table === 'pods');
      assert.equal(podsReqs.length, 2);
      for (const q of podsReqs) {
        assert.ok(
          q.filters.some(
            (f) =>
              f.op === 'eq' &&
              f.args[0] === 'status' &&
              f.args[1] === 'recruiting',
          ),
        );
      }
    });
  });
});
