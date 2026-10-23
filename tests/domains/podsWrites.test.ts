import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getPod, PodWriteError } from '../../domains/pods/pods.server';
import {
  applyPod,
  cancelPodApplication,
  createPod,
  resolveIdempotencyKey,
} from '../../domains/pods/pods.write.server';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type PodRow = Database['public']['Tables']['pods']['Row'];
type UploadRow = Database['public']['Tables']['uploads']['Row'];

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
  maybe_single?: boolean;
};

type RpcRequest = {
  fn: string;
  args: Record<string, unknown>;
  result: { data: unknown; error: { code?: string; message?: string } | null };
};

/** 쿼리 빌더 + rpc 를 흉내 내는 가짜 클라이언트 — 허용된 메서드만 노출(strict) */
function makeFakeClient(
  handlers: (req: Request) => { data: unknown; count?: number },
  rpcHandlers: (req: RpcRequest) => void,
  auth: { id: string } | { error: { status?: number } } = { id: 'u-1' },
) {
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
  const rpcRequests: RpcRequest[] = [];
  const client = {
    // 클라이언트 인스턴스에서 분리해 호출하면 즉시 throw — this 바인딩 회귀 감지
    from(table: string) {
      if (this !== client) {
        throw new Error(
          '가짜 클라이언트: from 은 클라이언트 인스턴스에 바인딩해 호출해야 합니다',
        );
      }
      const req: Request = {
        table,
        filters: [],
        orders: [],
        range: null,
      };
      requests.push(req);
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
          in(column: string, values: unknown[]) {
            req.filters.push({ op: 'in', args: [column, values] });
            return builder;
          },
          order(column: string, opts?: { ascending?: boolean }) {
            req.orders.push({ column, ascending: opts?.ascending ?? true });
            return builder;
          },
          maybeSingle() {
            req.maybe_single = true;
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
            // maybeSingle 은 0행을 null 로 정규화한다
            const rows = result.data as unknown[] | null;
            resolve({
              data:
                req.maybe_single && Array.isArray(rows)
                  ? (rows[0] ?? null)
                  : rows,
              count: result.count,
              error: null,
            });
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
    auth: {
      getUser: async () =>
        'id' in auth
          ? { data: { user: { id: auth.id } }, error: null }
          : {
              data: { user: null },
              error: {
                code: 'AuthSessionMissingError',
                message: 'Auth session missing!',
                status: auth.error.status ?? 400,
              },
            },
    },
    rpc(fn: string, args: Record<string, unknown>) {
      if (this !== client) {
        throw new Error(
          '가짜 클라이언트: rpc 는 클라이언트 인스턴스에 바인딩해 호출해야 합니다 (분리 호출 금지)',
        );
      }
      const req: RpcRequest = {
        fn,
        args,
        result: { data: undefined, error: null },
      };
      rpcRequests.push(req);
      rpcHandlers(req);
      return Promise.resolve(req.result);
    },
  };
  return {
    client: client as unknown as SupabaseClient<Database>,
    requests,
    rpcRequests,
  };
}

const joinedPod: PodRow & {
  products: { name: string; gid: string } | null;
} = {
  ...pod({ id: 'pod-1', member_count: 1, capacity: 2 }),
  products: { name: '참외', gid: 'gid-pc-001' },
};
const uploads: UploadRow[] = [
  upload({ gid: 'gid-pc-001', head_img: true, sort_order: 1 }),
];

/** rpc 성공 → 이후 getPod 재조회(happy path) 공통 스텁 */
function rpcSuccess(podId: string) {
  return (req: RpcRequest) => {
    req.result = { data: { podId }, error: null };
  };
}

describe('pods.server getPod', () => {
  it('pods 행 1건을 id eq 로 조회하고 products 조인·이미지까지 매핑한다', async () => {
    const { client, requests } = makeFakeClient(
      (req) =>
        req.table === 'pods' ? { data: [joinedPod] } : { data: uploads },
      () => {},
    );
    const podResult = await getPod('pod-1', client);
    assert.equal(requests.length, 2); // pods + uploads (N+1 아님)
    assert.match(requests[0].select ?? '', /products\(name, gid\)/);
    assert.ok(
      requests[0].filters.some(
        (f) => f.op === 'eq' && f.args[0] === 'id' && f.args[1] === 'pod-1',
      ),
    );
    assert.equal(podResult.id, 'pod-1');
    assert.equal(podResult.productName, '참외');
    assert.equal(podResult.imageUrl, '/uploads/images/test.png');
    assert.equal(podResult.currentCount, 1);
    assert.equal(podResult.targetCount, 2);
    assert.equal(podResult.status, 'open');
    assert.ok(/^(D-\d+|오늘 마감|마감)$/.test(podResult.deadlineLabel));
  });

  it('행이 없으면 404 PodWriteError 를 던진다', async () => {
    const { client } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
    );
    await assert.rejects(
      () => getPod('missing', client),
      (e: unknown) => {
        assert.ok(e instanceof PodWriteError);
        assert.equal(e.status, 404);
        return true;
      },
    );
  });
});

describe('pods.server createPod', () => {
  it('검증 통과 본문이면 rpc_create_pod rpc 를 걸고 재조회한 Pod 를 돌려준다', async () => {
    const { client, requests, rpcRequests } = makeFakeClient(
      (req) =>
        req.table === 'pods'
          ? {
              data: [{ ...joinedPod, id: 'pod-new', member_count: 1 }],
            }
          : { data: uploads },
      rpcSuccess('pod-new'),
    );
    const podResult = await createPod(
      'pc-001',
      { targetCount: 4, deadline: '2026-03-01' },
      client,
    );
    assert.equal(rpcRequests.length, 1);
    assert.equal(rpcRequests[0].fn, 'rpc_create_pod');
    assert.deepEqual(rpcRequests[0].args, {
      p_product_id: 'pc-001',
      p_capacity: 4,
      p_deadline: '2026-03-01',
    });
    // rpc 후 id 로 재조회해 Pod 를 돌려준다
    assert.ok(
      requests.some(
        (r) =>
          r.table === 'pods' &&
          r.filters.some(
            (f) =>
              f.op === 'eq' && f.args[0] === 'id' && f.args[1] === 'pod-new',
          ),
      ),
    );
    assert.equal(podResult.id, 'pod-new');
  });

  it('targetCount 가 정수 2~50 밖이면 400 PodWriteError', async () => {
    const { client, rpcRequests } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
    );
    for (const targetCount of [1, 51, 0, 2.5]) {
      await assert.rejects(
        () =>
          createPod('pc-001', { targetCount, deadline: '2026-03-01' }, client),
        (e: unknown) => {
          assert.ok(e instanceof PodWriteError);
          assert.equal(e.status, 400);
          return true;
        },
      );
    }
    assert.equal(rpcRequests.length, 0);
  });

  it('deadline 이 YYYY-MM-DD 가 아니거나 실재 날짜가 아니면 400', async () => {
    const { client } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
    );
    for (const deadline of ['2026-3-1', '2026/03/01', '2026-13-01', '', 'x']) {
      await assert.rejects(
        () => createPod('pc-001', { targetCount: 4, deadline }, client),
        (e: unknown) => {
          assert.ok(e instanceof PodWriteError);
          assert.equal(e.status, 400);
          return true;
        },
      );
    }
  });
});

describe('pods.server applyPod', () => {
  it('rpc_apply_pod rpc 에 podId·멱등 키를 전달하고 재조회 Pod 를 돌려준다', async () => {
    const { client, rpcRequests } = makeFakeClient(
      (req) =>
        req.table === 'pods' ? { data: [joinedPod] } : { data: uploads },
      rpcSuccess('pod-1'),
    );
    const podResult = await applyPod(
      'pod-1',
      '0e1d4a45-8bc0-4b31-9e8f-4d0f8f579f62',
      client,
    );
    assert.equal(rpcRequests[0].fn, 'rpc_apply_pod');
    assert.deepEqual(rpcRequests[0].args, {
      p_pod_id: 'pod-1',
      p_idempotency_key: '0e1d4a45-8bc0-4b31-9e8f-4d0f8f579f62',
    });
    assert.equal(podResult.id, 'pod-1');
  });
});

describe('pods.server cancelPodApplication', () => {
  it('rpc_cancel_pod_application rpc 를 걸고 재조회 Pod 를 돌려준다', async () => {
    const { client, rpcRequests } = makeFakeClient(
      (req) =>
        req.table === 'pods' ? { data: [joinedPod] } : { data: uploads },
      rpcSuccess('pod-1'),
    );
    const podResult = await cancelPodApplication('pod-1', client);
    assert.equal(rpcRequests[0].fn, 'rpc_cancel_pod_application');
    assert.deepEqual(rpcRequests[0].args, { p_pod_id: 'pod-1' });
    assert.equal(podResult.id, 'pod-1');
  });
});

describe('pods.server RPC 오류 매핑', () => {
  const cases: {
    name: string;
    code?: string;
    message: string;
    status: number;
    userMessage: string;
  }[] = [
    {
      name: 'UNAUTHORIZED(28000) → 401 로그인 필요',
      code: '28000',
      message: 'UNAUTHORIZED: 로그인이 필요합니다.',
      status: 401,
      userMessage: '로그인이 필요해요.',
    },
    {
      name: 'POD_NOT_FOUND(P0002) → 404',
      code: 'P0002',
      message: 'POD_NOT_FOUND: 팟을 찾을 수 없습니다.',
      status: 404,
      userMessage: '팟을 찾을 수 없어요.',
    },
    {
      name: 'PRODUCT_INACTIVE(P0001) → 409',
      code: 'P0001',
      message: 'PRODUCT_INACTIVE: 판매 중단된 상품입니다.',
      status: 409,
      userMessage: '판매가 중단된 상품이에요.',
    },
    {
      name: 'NOT_RECRUITING(P0001) → 409',
      code: 'P0001',
      message: 'NOT_RECRUITING: 모집 중인 팟이 아닙니다.',
      status: 409,
      userMessage: '모집 중인 팟이 아니에요.',
    },
    {
      name: 'DEADLINE_PASSED(P0001) → 409',
      code: 'P0001',
      message: 'DEADLINE_PASSED: 모집 마감 시간이 지났습니다.',
      status: 409,
      userMessage: '모집 마감 시간이 지났어요.',
    },
    {
      name: 'ALREADY_JOINED(P0001) → 409',
      code: 'P0001',
      message: 'ALREADY_JOINED: 이미 참여 중인 팟입니다.',
      status: 409,
      userMessage: '이미 참여 중인 팟이에요.',
    },
    {
      name: 'POD_FULL(P0001) → 409',
      code: 'P0001',
      message: 'POD_FULL: 모집 정원이 초과되었습니다.',
      status: 409,
      userMessage: '모집 정원이 가득 찼어요.',
    },
    {
      name: 'ALREADY_PAID(P0001) → 409',
      code: 'P0001',
      message: 'ALREADY_PAID: 결제가 완료된 팟은 취소할 수 없습니다.',
      status: 409,
      userMessage: '결제가 완료된 팟은 취소할 수 없어요.',
    },
    {
      name: 'NOT_A_MEMBER(P0002) → 404',
      code: 'P0002',
      message: 'NOT_A_MEMBER: 이 팟의 활성 참여자가 아닙니다.',
      status: 404,
      userMessage: '이 팟의 참여자가 아니에요.',
    },
    {
      name: 'PGRST202(함수 없음) → 500 일반 메시지, 원문 응답 노출 없음',
      code: 'PGRST202',
      message:
        'Could not find the function public.create_pod in the schema cache',
      status: 500,
      userMessage: '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
    },
  ];

  for (const c of cases) {
    it(c.name, async () => {
      const { client } = makeFakeClient(
        () => ({ data: [] }),
        (req) => {
          req.result = {
            data: null,
            error: { code: c.code, message: c.message },
          };
        },
      );
      await assert.rejects(
        () =>
          createPod(
            'pc-001',
            { targetCount: 4, deadline: '2026-03-01' },
            client,
          ),
        (e: unknown) => {
          assert.ok(e instanceof PodWriteError);
          assert.equal(e.status, c.status);
          assert.equal(e.message, c.userMessage);
          return true;
        },
      );
    });
  }

  it('원문이 코드 접두 없이 code 만 있어도 errcode 로 매핑한다(401)', async () => {
    const { client } = makeFakeClient(
      () => ({ data: [] }),
      (req) => {
        req.result = {
          data: null,
          error: { code: '28000', message: 'JWT 만료' },
        };
      },
    );
    await assert.rejects(
      () => applyPod('pod-1', '0e1d4a45-8bc0-4b31-9e8f-4d0f8f579f62', client),
      (e: unknown) => {
        assert.ok(e instanceof PodWriteError);
        assert.equal(e.status, 401);
        assert.equal(e.message, '로그인이 필요해요.');
        return true;
      },
    );
  });
});

describe('pods.server 쓰기 비로그인 게이트', () => {
  it('auth.getUser 세션 없음이면 rpc 호출 없이 401 로그인 필요를 던진다 (createPod)', async () => {
    const { client, rpcRequests } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
      { error: {} },
    );
    await assert.rejects(
      () =>
        createPod('pc-001', { targetCount: 4, deadline: '2026-03-01' }, client),
      (e: unknown) => {
        assert.ok(e instanceof PodWriteError);
        assert.equal(e.status, 401);
        assert.equal(e.message, '로그인이 필요해요.');
        return true;
      },
    );
    assert.equal(rpcRequests.length, 0);
  });

  it('auth.getUser 세션 없음이면 rpc 호출 없이 401 (applyPod)', async () => {
    const { client, rpcRequests } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
      { error: {} },
    );
    await assert.rejects(
      () => applyPod('pod-1', '0e1d4a45-8bc0-4b31-9e8f-4d0f8f579f62', client),
      (e: unknown) => {
        assert.ok(e instanceof PodWriteError);
        assert.equal(e.status, 401);
        assert.equal(e.message, '로그인이 필요해요.');
        return true;
      },
    );
    assert.equal(rpcRequests.length, 0);
  });

  it('auth.getUser 세션 없음이면 rpc 호출 없이 401 (cancelPodApplication)', async () => {
    const { client, rpcRequests } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
      { error: {} },
    );
    await assert.rejects(
      () => cancelPodApplication('pod-1', client),
      (e: unknown) => {
        assert.ok(e instanceof PodWriteError);
        assert.equal(e.status, 401);
        assert.equal(e.message, '로그인이 필요해요.');
        return true;
      },
    );
    assert.equal(rpcRequests.length, 0);
  });

  it('가짜 클라이언트 rpc 를 분리 호출하면 즉시 throw 한다(this 바인딩 회귀 감지)', async () => {
    const { client } = makeFakeClient(
      () => ({ data: [] }),
      () => {},
    );
    const detached = client.rpc as unknown as (
      fn: string,
      args?: Record<string, unknown>,
    ) => unknown;
    assert.throws(() => detached('rpc_create_pod', {}), /바인딩해 호출/);
  });
});

describe('pods.server 멱등 키', () => {
  it('헤더에 uuid 멱등 키가 있으면 그대로 사용한다', () => {
    const key = '0e1d4a45-8bc0-4b31-9e8f-4d0f8f579f62';
    assert.equal(resolveIdempotencyKey(key), key);
  });

  it('헤더가 없거나 uuid 형식이 아니면 새 uuid 를 발급한다', () => {
    assert.match(resolveIdempotencyKey(null), /^[0-9a-f-]{36}$/);
    assert.match(
      resolveIdempotencyKey('not-a-uuid'),
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
