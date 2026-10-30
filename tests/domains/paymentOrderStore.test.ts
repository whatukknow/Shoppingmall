import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  findOrder,
  insertPendingOrder,
  markOrderPaid,
  type OrderStoreClients,
} from '../../domains/payment/data/payment.order-store';
import { confirmPaymentAction } from '../../domains/payment/payment.actions';
import type { TossConfirmResponse } from '../../domains/payment/pg-toss/toss.service';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type OrdersRow = Database['public']['Tables']['orders']['Row'];
type OrderItemsRow = Database['public']['Tables']['order_items']['Row'];

type Request = {
  table: string;
  select?: string | { head?: boolean };
  op?: 'update';
  payload?: unknown;
  filters: { op: string; args: unknown[] }[];
  /** from 호출이 발생한 클라이언트 측 */
  side: 'session' | 'admin';
};

type RpcRequest = {
  fn: string;
  args: Record<string, unknown>;
  result: { data: unknown; error: { code?: string; message?: string } | null };
};

const UID = 'u-user-id-0001';

function orderFixture(amount = 14800) {
  return {
    podIds: ['p1', 'p2'],
    amount,
    shippingFee: 3000,
    items: [
      {
        podId: 'p1',
        productName: '용인 블루베리',
        optionLabel: '1팩',
        quantity: 1,
        unitPrice: 5400,
        imageUrl: '/img/blueberry.png',
      },
      {
        podId: 'p2',
        productName: '시흥 스테비아 토마토',
        optionLabel: '2팩',
        quantity: 1,
        unitPrice: 6400,
        imageUrl: '/img/tomato.png',
      },
    ],
    shippingInfo: {
      recipientName: '김대현',
      recipientPhone: '010-1234-5678',
      postalCode: '06000',
      recipientAddress: '서울 강남구 테헤란로 1',
      recipientAddressDetail: '101동 101호',
      entranceInstructions: '비밀번호 1234',
    },
    status: 'PENDING' as const,
  };
}

/** rpc_create_order 의 성공 응답 (RPC 가 배송비 3000원을 직접 기록) */
const RPC_ORDER_RESULT = {
  orderId: 'ord_1a2b3c4d5e6f',
  subtotal: 11800,
  shippingFee: 3000,
  total: 14800,
};

/**
 * 쿼리 빌더 + rpc 를 흉내 내는 가짜 클라이언트.
 * session(auth+rpc+from) · admin(rpc 전용) 분리 — service_role 전용 rpc 는 admin 에만.
 */
function makeFakeClients(
  fromImpl: (req: Request, i: number) => unknown,
  rpcHandler: (req: RpcRequest, side: 'session' | 'admin') => void,
  auth: { user?: string; error?: boolean } = { user: UID },
) {
  const allowed = new Set([
    'select',
    'eq',
    'is',
    'update',
    'maybeSingle',
    'then',
  ]);
  const requests: Request[] = [];
  const rpcRequests: RpcRequest[] = [];
  const adminRpcRequests: RpcRequest[] = [];

  const sessionRpc = {
    rpc(fn: string, args: Record<string, unknown>) {
      const req: RpcRequest = {
        fn,
        args,
        result: { data: undefined, error: null },
      };
      rpcRequests.push(req);
      rpcHandler(req, 'session');
      return Promise.resolve(req.result);
    },
  };
  const adminRpc = {
    rpc(fn: string, args: Record<string, unknown>) {
      const req: RpcRequest = {
        fn,
        args,
        result: { data: undefined, error: null },
      };
      adminRpcRequests.push(req);
      rpcHandler(req, 'admin');
      return Promise.resolve(req.result);
    },
  };

  let index = 0;
  const fromBindings: { session: object | null; admin: object | null } = {
    session: null,
    admin: null,
  };
  // 동일 빌더 로직을 session/admin 양쪽에서 재사용한다 (req.side 로 기록 구분)
  const makeFrom = function (side: 'session' | 'admin') {
    const bound = () =>
      side === 'session' ? fromBindings.session : fromBindings.admin;
    return function (this: unknown, table: string) {
      if (this !== bound()) {
        throw new Error(`가짜 클라이언트(${side}): from 바인딩 필요`);
      }
      const req: Request = { table, filters: [], side };
      requests.push(req);
      const i = index++;
      const builder: unknown = new Proxy(
        {
          select(sel: string | { head?: boolean }) {
            req.select = sel;
            return builder;
          },
          eq(column: string, value: unknown) {
            req.filters.push({ op: 'eq', args: [column, value] });
            return builder;
          },
          is(column: string, value: unknown) {
            req.filters.push({ op: 'is', args: [column, value] });
            return builder;
          },
          update(payload: unknown) {
            req.op = 'update';
            req.payload = payload;
            return builder;
          },
          maybeSingle() {
            return builder;
          },
          then(
            resolve: (r: {
              data: unknown;
              error: { message: string } | null;
            }) => void,
          ) {
            const outcome = fromImpl(req, i) as {
              data: unknown;
              error?: { message: string } | null;
            };
            resolve({ data: outcome.data, error: outcome.error ?? null });
            return undefined;
          },
        },
        {
          get(target, prop) {
            if (typeof prop === 'symbol' || !allowed.has(String(prop))) {
              throw new TypeError(
                `가짜 클라이언트: 없는 메서드/속성 호출: ${String(prop)} (@${req.table})`,
              );
            }
            return target[prop as keyof typeof target];
          },
        },
      );
      return builder;
    };
  };

  const sessionObj = {
    auth: {
      getUser: async () =>
        auth.user
          ? { data: { user: { id: auth.user } }, error: null }
          : { data: { user: null }, error: {} },
    },
    // from 는 세션 클라이언트 전용 조회 경로 (하단에서 주입)
    rpc(fn: string, args: Record<string, unknown>) {
      if (this !== sessionObj) {
        throw new Error(
          '가짜 클라이언트: rpc 는 인스턴스에 바인딩해 호출해야 합니다',
        );
      }
      return sessionRpc.rpc.apply(sessionRpc, [fn, args]);
    },
  };
  fromBindings.session = sessionObj;
  (sessionObj as unknown as { from: unknown }).from = makeFrom('session');
  const adminObj = {
    rpc(fn: string, args: Record<string, unknown>) {
      if (this !== adminObj) {
        throw new Error(
          '가짜 클라이언트: rpc 는 인스턴스에 바인딩해 호출해야 합니다',
        );
      }
      return adminRpc.rpc.apply(adminRpc, [fn, args]);
    },
  };
  fromBindings.admin = adminObj;
  const clients: OrderStoreClients = {
    session: sessionObj as unknown as SupabaseClient<Database>,
    admin: adminObj as unknown as SupabaseClient<Database>,
  };
  return { clients, requests, rpcRequests, adminRpcRequests };
}

const itemsSeed: OrderItemsRow[] = [
  {
    id: 'oi_1',
    product_name: '용인 블루베리',
    portion_label: '1팩',
    unit_price: 5400,
    image_url: '/img/blueberry.png',
    product_id: 'pc-1',
    pod_id: 'p1',
    participant_id: 11,
    order_id: 'ord_1a2b3c4d5e6f',
  },
  {
    id: 'oi_2',
    product_name: '시흥 스테비아 토마토',
    portion_label: '2팩',
    unit_price: 6400,
    image_url: '/img/tomato.png',
    product_id: 'pc-2',
    pod_id: 'p2',
    participant_id: 12,
    order_id: 'ord_1a2b3c4d5e6f',
  },
];

function pendingOrderRow(): OrdersRow {
  return {
    id: 'ord_1a2b3c4d5e6f',
    status: 'pending',
    payment_mode: 'toss',
    subtotal: 11800,
    base_shipping_fee: 3000,
    fresh_packaging_fee: 0,
    shipping_fee: 3000,
    discount: 0,
    total: 14800,
    recipient_name: '김대현',
    recipient_phone: '010-1234-5678',
    postal_code: '06000',
    recipient_address: '서울 강남구 테헤란로 1',
    recipient_address_detail: '101동 101호',
    entrance_instructions: '비밀번호 1234',
    payment_method: null,
    privacy_consented_at: null,
    privacy_version: null,
    idempotency_key: null,
    created_at: null,
    paid_at: null,
    profile_id: UID,
  };
}

// --- insertPendingOrder ------------------------------------------------------

describe('insertPendingOrder (rpc_create_order)', () => {
  it('세션 클라이언트로 rpc_create_order 를 호출하고 podIds·payment_method·recipient·멱등 키를 넘긴다', async () => {
    const { clients, rpcRequests, adminRpcRequests } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        req.result = { data: RPC_ORDER_RESULT, error: null };
      },
    );
    const result = await insertPendingOrder(orderFixture(), clients);
    assert.equal(rpcRequests.length, 1);
    assert.equal(
      adminRpcRequests.length,
      0,
      '주문 생성 rpc 는 세션 클라이언트로',
    );
    assert.equal(rpcRequests[0].fn, 'rpc_create_order');
    const args = rpcRequests[0].args;
    assert.deepEqual(args.p_pod_ids, ['p1', 'p2']);
    assert.equal(args.p_payment_method, 'toss');
    assert.deepEqual(args.p_recipient, {
      name: '김대현',
      phone: '010-1234-5678',
      postalCode: '06000',
      address: '서울 강남구 테헤란로 1',
      addressDetail: '101동 101호',
      entranceInstructions: '비밀번호 1234',
    });
    assert.match(String(args.p_idempotency_key), /^[0-9a-f-]{36}$/i);
    assert.equal(result.orderId, 'ord_1a2b3c4d5e6f');
    assert.equal(result.subtotal, 11800);
  });

  it('멱등 키는 호출마다 새 UUID (재호출 시 다른 키)', async () => {
    const keys: unknown[] = [];
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        keys.push(req.args.p_idempotency_key);
        req.result = { data: RPC_ORDER_RESULT, error: null };
      },
    );
    await insertPendingOrder(orderFixture(), clients);
    await insertPendingOrder(orderFixture(), clients);
    assert.equal(keys.length, 2);
    assert.notEqual(keys[0], keys[1]);
  });

  it('관리자 클라이언트(from·rpc) 를 전혀 호출하지 않는다', async () => {
    let adminCalls = 0;
    const { clients, requests, adminRpcRequests } = makeFakeClients(
      (req) => {
        if (req.side === 'admin') adminCalls += 1;
        return { data: null };
      },
      (req) => {
        req.result = { data: RPC_ORDER_RESULT, error: null };
      },
    );
    await insertPendingOrder(orderFixture(), clients);
    assert.equal(
      adminCalls,
      0,
      'admin from 쿼리 없음 — 배송비 보정 update 삭제',
    );
    assert.equal(
      requests.filter((r) => r.side === 'admin').length,
      0,
      'admin 측 from 쿼리 없음',
    );
    assert.equal(adminRpcRequests.length, 0, 'admin rpc 없음');
  });

  it('RPC 응답의 shippingFee·total 을 그대로 반환한다', async () => {
    const { clients, requests } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        req.result = { data: RPC_ORDER_RESULT, error: null };
      },
    );
    const result = await insertPendingOrder(orderFixture(), clients);
    assert.equal(result.shippingFee, 3000);
    assert.equal(result.total, 14800);
    assert.equal(
      requests.some((r) => r.op === 'update'),
      false,
      'orders update 없음',
    );
  });

  it('RPC 응답에 shippingFee·total 이 없으면 액션 계산값으로 반환한다 (하위 호환)', async () => {
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        req.result = {
          data: { orderId: 'ord_1a2b3c4d5e6f', subtotal: 11800 },
          error: null,
        };
      },
    );
    const result = await insertPendingOrder(
      { ...orderFixture(), shippingFee: 3000 },
      clients,
    );
    assert.equal(result.shippingFee, 3000);
    assert.equal(result.total, 14800);
  });

  it('액션 금액 ≠ RPC total 이면 실패 처리하고 어떤 update 도 하지 않는다', async () => {
    let updated = false;
    const { clients, requests } = makeFakeClients(
      (req) => {
        if (req.op === 'update') updated = true;
        return { data: null };
      },
      (req) => {
        req.result = {
          data: { ...RPC_ORDER_RESULT, total: 12300 },
          error: null,
        };
      },
    );
    await assert.rejects(
      () => insertPendingOrder(orderFixture(14800), clients),
      /order total/,
    );
    assert.equal(requests.length, 0);
    assert.equal(updated, false);
  });

  it('rpc 오류 코드 접두를 사용자 메시지로 매핑한다 (NOT_PAYMENT_READY / PAYMENT_DUE_PASSED / 기타)', async () => {
    const cases = [
      {
        message: 'NOT_PAYMENT_READY: 아직 결제 준비가 안 됐습니다.',
        expect: /not ready for payment/,
      },
      {
        message: 'PAYMENT_DUE_PASSED: 결제 기한이 지났습니다.',
        expect: /payment deadline has passed/,
      },
      {
        message: 'INTERNAL_CONFLICT: 동시 처리 충돌입니다.',
        expect: /Could not process your order/,
      },
    ];
    for (const c of cases) {
      const { clients } = makeFakeClients(
        () => ({ data: null }),
        (req) => {
          req.result = {
            data: null,
            error: { code: 'P0001', message: c.message },
          };
        },
      );
      await assert.rejects(
        () => insertPendingOrder(orderFixture(), clients),
        c.expect,
      );
    }
  });

  it('rpc 를 인스턴스에서 분리 호출하면 즉시 throw 한다 (this 유실 회귀)', async () => {
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      () => {},
    );
    const session = clients.session as unknown as { rpc: unknown };
    const detached = session.rpc as (fn: string, args?: object) => unknown;
    assert.throws(() => detached('rpc_create_order', {}), /바인딩/);
  });

  it('비로그인이면 rpc 호출 없이 거부한다', async () => {
    const { clients, rpcRequests } = makeFakeClients(
      () => ({ data: null }),
      () => {},
      { error: true },
    );
    await assert.rejects(
      () => insertPendingOrder(orderFixture(), clients),
      /Please log in/,
    );
    assert.equal(rpcRequests.length, 0);
  });
});

// --- markOrderPaid -------------------------------------------------------------

describe('markOrderPaid (rpc_mark_order_paid)', () => {
  it('관리자 클라이언트로 rpc_mark_order_paid 를 호출한다 (service_role 전용)', async () => {
    const { clients, rpcRequests, adminRpcRequests } = makeFakeClients(
      () => ({ data: null }),
      (req, side) => {
        assert.equal(
          side,
          'admin',
          'mark_order_paid 는 admin 클라이언트로 호출',
        );
        req.result = {
          data: {
            orderId: 'ord_1a2b3c4d5e6f',
            paid: true,
          },
          error: null,
        };
      },
    );
    await markOrderPaid('ord_1a2b3c4d5e6f', 'tgen_key0001', null, clients);
    assert.equal(adminRpcRequests.length, 1);
    assert.deepEqual(adminRpcRequests[0].args, {
      p_order_id: 'ord_1a2b3c4d5e6f',
      p_payment_key: 'tgen_key0001',
    });
    assert.equal(rpcRequests.length, 0, '세션 클라이언트로 호출 금지');
  });

  it('rpc 오류면 거부한다 (원문 노출 없이 일반 메시지)', async () => {
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        req.result = {
          data: null,
          error: {
            code: 'P0001',
            message: 'NOT_PAYMENT_READY: 아직 안 됩니다.',
          },
        };
      },
    );
    await assert.rejects(
      () => markOrderPaid('ord_x', 'tgen_key', null, clients),
      /주문 PAID/,
    );
  });
});

// --- 이중결제 차단 (리뷰 F-1) ---------------------------------------------

import {
  ALREADY_PAID_PARTICIPANT_MESSAGE,
  CONFIRM_RECHECK_MESSAGE,
  hasBlockedParticipants,
} from '../../domains/payment/data/payment.order-store';

function podParticipantsRow(
  overrides: Partial<{
    id: number;
    paid_at: string | null;
    paid_order_id: string | null;
    is_active: boolean | null;
  }> = {},
) {
  return {
    id: 11,
    paid_at: null,
    paid_order_id: null,
    is_active: true,
    ...overrides,
  };
}

describe('hasBlockedParticipants (세션 클라이언트 사전 판정)', () => {
  function blockedClients(
    podOutcome: () => { data: unknown; error?: { message: string } | null },
  ) {
    return makeFakeClients(
      (req) => {
        if (req.table === 'orders') return { data: pendingOrderRow() };
        if (req.table === 'order_items') return { data: itemsSeed };
        if (req.table === 'pod_participants') return podOutcome();
        return { data: null };
      },
      () => {},
    );
  }

  it('모든 참여자 paid_at null·is_active true 면 차단하지 않는다(false)', async () => {
    const { clients } = makeFakeClients(
      (req) => {
        if (req.table === 'order_items') return { data: itemsSeed };
        return { data: podParticipantsRow() };
      },
      () => {},
    );
    const blocked = await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
    assert.equal(blocked, false);
  });

  it('participant_id 별로 pod_participants 를 세션 클라이언트로 조회한다', async () => {
    const podQueries: { filters: unknown }[] = [];
    const { clients } = makeFakeClients(
      (req) => {
        if (req.table === 'order_items') return { data: itemsSeed };
        if (req.table === 'pod_participants') {
          podQueries.push({ filters: req.filters });
          // 첫 참여자(11)만 셋업 응답 — 마지막 요청은 order_items 이므로 무관
          return podQueries.length === 0
            ? { data: podParticipantsRow() }
            : { data: podParticipantsRow() };
        }
        return { data: null };
      },
      () => {},
    );
    await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
    assert.equal(podQueries.length, 2, 'participant 2 건 → 개별 조회 2 회');
    assert.deepEqual(podQueries[0].filters, [{ op: 'eq', args: ['id', 11] }]);
    assert.deepEqual(podQueries[1].filters, [{ op: 'eq', args: ['id', 12] }]);
  });

  it('차단 판정 조회는 세션 클라이언트(req.side === session) 로만 이뤄진다', async () => {
    const { clients, requests } = makeFakeClients(
      (req) => {
        if (req.table === 'order_items') return { data: itemsSeed };
        if (req.table === 'pod_participants')
          return { data: podParticipantsRow() };
        return { data: null };
      },
      () => {},
    );
    await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
    assert.equal(
      requests.some((r) => r.side === 'admin'),
      false,
      'admin 측 from 쿼리 없음',
    );
    assert.ok(requests.every((r) => r.side === 'session'));
  });

  it('다른 주문으로 이미 결제된 참여자(paid_at != null) 가 있으면 차단한다', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const { clients } = blockedClients(() => ({
        data: podParticipantsRow({
          paid_at: '2026-01-01T00:00:00Z',
          paid_order_id: 'other-order',
        }),
      }));
      const blocked = await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
      assert.equal(blocked, true);
    } finally {
      console.error = original;
    }
  });

  it('비활성 참여자(is_active === false) 가 있으면 차단한다', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const { clients } = blockedClients(() => ({
        data: podParticipantsRow({ is_active: false }),
      }));
      const blocked = await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
      assert.equal(blocked, true);
    } finally {
      console.error = original;
    }
  });

  it('pod_participants 조회 실패 시 판정 불가 → 안전하게 차단한다(true)', async () => {
    const errors: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => void errors.push(args);
    try {
      const { clients } = blockedClients(() => ({
        data: null,
        error: { message: 'db down' },
      }));
      const blocked = await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
      assert.equal(blocked, true);
      assert.equal(errors.length >= 1, true, '실패 원인을 로그로 남긴다');
    } finally {
      console.error = original;
    }
  });

  it('order_items 조회 실패 시 판정 불가 → 안전하게 차단한다(true)', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const { clients } = makeFakeClients(
        (req) => {
          if (req.table === 'order_items')
            return { data: null, error: { message: 'db down' } };
          return { data: null };
        },
        () => {},
      );
      const blocked = await hasBlockedParticipants('ord_1a2b3c4d5e6f', clients);
      assert.equal(blocked, true);
    } finally {
      console.error = original;
    }
  });
});

// --- rpc 오류 매핑 문구 확장 -----------------------------------------------

describe('mapOrderRpcError (주문 rpc 오류 사용자 문구 확장)', () => {
  const cases = [
    {
      message: 'ALREADY_PAID: 상태 충돌: 참여자가 이미 결제됨',
      expect: /already been paid for\./,
    },
    {
      message: 'NOT_A_MEMBER: 참여자가 아닙니다',
      expect: /already been paid for\./,
    },
    {
      message: 'PARTICIPANT_ALREADY_PAID: 상태: 다른 주문 이미 결제됨',
      expect: /already been paid for\./,
    },
    {
      message: 'POD_NOT_FOUND: 팟 없음',
      expect: /Please select your buying groups again\./,
    },
    {
      message: 'EMPTY_PODS: 빈 팟',
      expect: /Please select your buying groups again\./,
    },
    {
      message: 'DUPLICATE_PODS: 팟 중복',
      expect: /Please select your buying groups again\./,
    },
  ];
  for (const c of cases) {
    it(`${c.message.split(':')[0]} 원문 비노출 매핑`, async () => {
      const original = console.error;
      console.error = () => {};
      const { clients } = makeFakeClients(
        () => ({ data: null }),
        (req) => {
          req.result = {
            data: null,
            error: { code: 'P0001', message: c.message },
          };
        },
      );
      try {
        await assert.rejects(
          () => insertPendingOrder(orderFixture(), clients),
          c.expect,
        );
      } finally {
        console.error = original;
      }
    });
  }

  it('내부 상태 원문을 사용자 메시지에 노출하지 않는다', async () => {
    const original = console.error;
    console.error = () => {};
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      (req) => {
        req.result = {
          data: null,
          error: {
            code: 'P0001',
            message: 'ALREADY_PAID: pod_state=conflict-abc123',
          },
        };
      },
    );
    try {
      await assert.rejects(
        () => insertPendingOrder(orderFixture(), clients),
        (e: Error) => {
          assert.equal(e.message, ALREADY_PAID_PARTICIPANT_MESSAGE);
          assert.ok(!e.message.includes('conflict-abc123'));
          return true;
        },
      );
    } finally {
      console.error = original;
    }
  });
});

// --- confirmPaymentAction 이중결제 차단 ----------------------------------------

describe('confirmPaymentAction 이중결제 차단', () => {
  /**
   * 테이블 기반 dispatch 가짜 클라이언트: pod_participants 상태를
   * 호출 순서별로 주입해 "사전 판정 clean → 재검사 paid" 경쟁을 흉내 낸다.
   */
  function orderClientsV2(
    row: OrdersRow,
    opts: {
      podParticipants?: (call: number) => {
        data: unknown;
        error?: { message: string } | null;
      };
    } = {},
  ) {
    let podCall = 0;
    return makeFakeClients(
      (req) => {
        assert.ok(
          ['orders', 'order_items', 'pod_participants'].includes(req.table),
          `예상치 못한 테이블: ${req.table}`,
        );
        if (req.table === 'orders') return { data: row };
        if (req.table === 'pod_participants') {
          return (
            opts.podParticipants?.(podCall++) ?? {
              data: podParticipantsRow(),
            }
          );
        }
        return { data: itemsSeed };
      },
      (req, side) => {
        assert.equal(side, 'admin');
        void req;
      },
    );
  }

  async function withCountingFetch<T>(
    fetchImpl: () => { status: number; json: unknown },
    fn: () => Promise<T>,
  ): Promise<{ result: T; fetchCalls: number }> {
    const original = globalThis.fetch;
    process.env.TOSS_SECRET_KEY = 'sk_test_lookup';
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      const outcome = fetchImpl();
      return {
        ok: outcome.status < 400,
        status: outcome.status,
        json: async () => outcome.json,
      } as unknown as Response;
    }) as typeof fetch;
    try {
      return { result: await fn(), fetchCalls };
    } finally {
      globalThis.fetch = original;
    }
  }

  const input = {
    paymentKey: 'tgen_fresh01',
    orderId: 'ord_1a2b3c4d5e6f',
    amount: 14800,
  };

  const tossOk = (): { status: number; json: unknown } => ({
    status: 200,
    json: {
      paymentKey: 'tgen_fresh01',
      orderId: 'ord_1a2b3c4d5e6f',
      status: 'DONE',
      method: '카드',
      totalAmount: 14800,
      approvedAt: '2026-01-02T00:00:00Z',
      receipt: { url: 'https://receipt.toss/2' },
    },
  });

  it('토스 승인 호출 전 차단: 다른 주문으로 결제된 참여자가 있으면 fetch 없이 실패 응답', async () => {
    const { clients } = orderClientsV2(pendingOrderRow(), {
      podParticipants: () => ({
        data: podParticipantsRow({
          paid_at: '2026-01-01T00:00:00Z',
          paid_order_id: 'other-order',
        }),
      }),
    });
    const { result, fetchCalls } = await withCountingFetch(tossOk, () =>
      confirmPaymentAction(input, clients),
    );
    assert.equal(result.success, false);
    assert.equal(
      !result.success && result.message,
      ALREADY_PAID_PARTICIPANT_MESSAGE,
    );
    assert.equal(fetchCalls, 0, '토스 승인 API 를 호출하지 않아야 한다');
  });

  it('토스 승인 호출 전 차단: 비활성 참여자가 있으면 fetch 없이 실패 응답', async () => {
    const { clients } = orderClientsV2(pendingOrderRow(), {
      podParticipants: () => ({
        data: podParticipantsRow({ is_active: false }),
      }),
    });
    const { result, fetchCalls } = await withCountingFetch(tossOk, () =>
      confirmPaymentAction(input, clients),
    );
    assert.equal(result.success, false);
    assert.equal(
      !result.success && result.message,
      ALREADY_PAID_PARTICIPANT_MESSAGE,
    );
    assert.equal(fetchCalls, 0);
  });

  it('확정 직전 재검사에서 차단: rpc_mark_order_paid 미호출 + 고객센터 안내 실패 응답', async () => {
    // 사전 판정(1회) clean → 승인 직후 재검차 paid: 경쟁 승인 흉내
    const { clients, adminRpcRequests } = orderClientsV2(pendingOrderRow(), {
      podParticipants: (call) =>
        call < 2 // 사전 판정 2건( 참여자 11·12) 은 clean, 재검차부터 paid
          ? { data: podParticipantsRow() }
          : {
              data: podParticipantsRow({
                paid_at: '2026-01-02T00:00:00Z',
                paid_order_id: 'other-order-2',
              }),
            },
    });
    const originalError = console.error;
    const errors: unknown[][] = [];
    console.error = (...args: unknown[]) => void errors.push(args);
    try {
      const { result, fetchCalls } = await withCountingFetch(tossOk, () =>
        confirmPaymentAction(input, clients),
      );
      assert.equal(result.success, false);
      assert.equal(!result.success && result.message, CONFIRM_RECHECK_MESSAGE);
      assert.equal(fetchCalls, 1, '토스 승인 1회 후 확정 단계에서 차단');
      assert.equal(
        adminRpcRequests.filter((r) => r.fn === 'rpc_mark_order_paid').length,
        0,
        '차단 시 rpc_mark_order_paid 를 호출하지 않아야 한다',
      );
      assert.equal(
        errors.some((args) => args.some((a) => String(a).includes('tgen_fre'))),
        true,
        '차단 로그에 결제 키 앞 8자를 기록한다',
      );
      assert.equal(
        errors.some((args) =>
          args.some((a) => String(a).includes('tgen_fresh01')),
        ),
        false,
        '전체 결제 키를 로그에 남기지 않는다',
      );
    } finally {
      console.error = originalError;
    }
  });

  it('확정 직전 재검사에서 차단(비활성 참여자): rpc_mark_order_paid 미호출', async () => {
    const { clients, adminRpcRequests } = orderClientsV2(pendingOrderRow(), {
      podParticipants: (call) =>
        call < 2 // 사전 판정 2건은 clean, 재검차부터 비활성
          ? { data: podParticipantsRow() }
          : { data: podParticipantsRow({ is_active: false }) },
    });
    const { result } = await withCountingFetch(tossOk, () =>
      confirmPaymentAction(input, clients),
    );
    assert.equal(result.success, false);
    assert.equal(
      adminRpcRequests.filter((r) => r.fn === 'rpc_mark_order_paid').length,
      0,
    );
  });

  it('정상 경로 회귀: 참여자 clean 이면 토스 승인 → rpc_mark_order_paid 까지 진행', async () => {
    const { clients, adminRpcRequests } = orderClientsV2(pendingOrderRow());
    const { result, fetchCalls } = await withCountingFetch(tossOk, () =>
      confirmPaymentAction(input, clients),
    );
    assert.equal(result.success, true);
    assert.equal(result.success && result.receiptUrl, 'https://receipt.toss/2');
    assert.equal(fetchCalls, 1);
    assert.equal(adminRpcRequests.length, 1);
    assert.equal(adminRpcRequests[0].fn, 'rpc_mark_order_paid');
  });
});

// --- findOrder (기존 쿼리 유지) -----------------------------------------------

describe('findOrder', () => {
  it('주문 조회는 세션 클라이언트로만 이뤄진다 (admin from 쿼리 없음)', async () => {
    const { clients, requests } = makeFakeClients(
      (req) => {
        if (req.table === 'orders') return { data: pendingOrderRow() };
        return { data: itemsSeed };
      },
      () => {},
    );
    await findOrder('ord_1a2b3c4d5e6f', clients);
    assert.ok(requests.length >= 2);
    assert.ok(requests.every((r) => r.side === 'session'));
  });

  it('본인 주문을 OrderRecord 로 변환한다', async () => {
    const { clients, requests } = makeFakeClients(
      (req, i) => {
        assert.equal(req.table, ['orders', 'order_items'][i]);
        if (i === 0) {
          assert.deepEqual(req.filters, [
            { op: 'eq', args: ['id', 'ord_1a2b3c4d5e6f'] },
            { op: 'eq', args: ['profile_id', UID] },
          ]);
          return { data: pendingOrderRow() };
        }
        return { data: itemsSeed };
      },
      () => {},
    );
    const order = await findOrder('ord_1a2b3c4d5e6f', clients);
    assert.equal(order?.orderId, 'ord_1a2b3c4d5e6f');
    assert.equal(order?.status, 'PENDING');
    assert.equal(order?.amount, 14800);
    assert.equal(order?.shippingFee, 3000);
    assert.deepEqual(order?.podIds, ['p1', 'p2']);
    assert.equal(order?.items?.length, 2);
    assert.deepEqual(requests[0].filters[1], {
      op: 'eq',
      args: ['profile_id', UID],
    });
  });

  it('다른 사람의 주문은 조회하지 못한다', async () => {
    const { clients } = makeFakeClients(
      () => ({ data: null }),
      () => {},
    );
    const order = await findOrder('ord_1a2b3c4d5e6f', clients);
    assert.equal(order, null);
  });

  it('비로그인이면 주문 없음(null) 으로 처리한다', async () => {
    const { clients, requests } = makeFakeClients(
      () => ({ data: null }),
      () => {},
      { error: true },
    );
    const order = await findOrder('ord_1a2b3c4d5e6f', clients);
    assert.equal(order, null);
    assert.equal(requests.length, 0);
  });
});

// --- confirmPaymentAction ------------------------------------------------------

describe('confirmPaymentAction', () => {
  const PAID_KEY = 'tgen_paidkey001';

  function paidRow(): OrdersRow {
    return {
      ...pendingOrderRow(),
      status: 'paid',
      paid_at: '2026-01-02T00:00:00Z',
    };
  }

  function orderClients(
    row: OrdersRow,
    rpcImpl?: (req: RpcRequest, attempt: number) => void,
  ) {
    let rpcAttempt = 0;
    return makeFakeClients(
      (req) => {
        // 리뷰 F-1 대응: 이중결제 사전 판정 쿼리(order_items·pod_participants)가
        // 주문 조회 시퀀스에 추가되었으므로 테이블 dispatch 로 갱신 (근거: 보고)
        if (req.table === 'orders') return { data: row };
        if (req.table === 'order_items') return { data: itemsSeed };
        if (req.table === 'pod_participants')
          return { data: podParticipantsRow() };
        return { data: null };
      },
      (req, side) => {
        assert.equal(side, 'admin');
        rpcImpl?.(req, rpcAttempt++);
      },
    );
  }

  function tossStubResponse(
    overrides: Partial<TossConfirmResponse> = {},
  ): TossConfirmResponse {
    return {
      paymentKey: PAID_KEY,
      orderId: 'ord_1a2b3c4d5e6f',
      status: 'DONE',
      method: '카드',
      totalAmount: 14800,
      approvedAt: '2026-01-02T00:00:00Z',
      receipt: { url: 'https://receipt.toss/1' },
      ...overrides,
    };
  }

  async function withTossFetch<T>(
    impl: () => Promise<{ status: number; json: unknown } | Error>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const original = globalThis.fetch;
    process.env.TOSS_SECRET_KEY = 'sk_test_lookup';
    globalThis.fetch = (async () => {
      const outcome = await impl();
      if (outcome instanceof Error) throw outcome;
      return {
        ok: outcome.status < 400,
        status: outcome.status,
        json: async () => outcome.json,
      } as unknown as Response;
    }) as typeof fetch;
    try {
      return await fn();
    } finally {
      globalThis.fetch = original;
    }
  }

  it('이미 PAID 주문에 같은 결제 재시도하면 토스 조회로 멱등 성공한다 (rpc 호출 없음)', async () => {
    const { clients, adminRpcRequests } = orderClients(paidRow());
    const result = await withTossFetch(
      async () => ({ status: 200, json: tossStubResponse() }),
      () =>
        confirmPaymentAction(
          { paymentKey: PAID_KEY, orderId: 'ord_1a2b3c4d5e6f', amount: 14800 },
          clients,
        ),
    );
    assert.equal(result.success, true);
    assert.equal(result.success && result.receiptUrl, 'https://receipt.toss/1');
    assert.equal(adminRpcRequests.length, 0);
  });

  it('이미 PAID 주문에 토스 조회 결과가 다른 주문이면 PAYMENT_MISMATCH', async () => {
    const { clients } = orderClients(paidRow());
    const result = await withTossFetch(
      async () => ({
        status: 200,
        json: tossStubResponse({ orderId: 'ORD-other' }),
      }),
      () =>
        confirmPaymentAction(
          { paymentKey: PAID_KEY, orderId: 'ord_1a2b3c4d5e6f', amount: 14800 },
          clients,
        ),
    );
    assert.equal(result.success, false);
    assert.equal(!result.success && result.code, 'PAYMENT_MISMATCH');
  });

  it('PENDING 주문 승인 후 rpc 실패하면 1회 재시도하고 성공 계열 응답을 유지한다', async () => {
    const errors: unknown[][] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => void errors.push(args);
    const { clients, adminRpcRequests } = orderClients(pendingOrderRow());
    let attempts = 0;
    try {
      const result = await withTossFetch(
        async () => ({
          status: 200,
          json: { ...tossStubResponse(), paymentKey: 'tgen_newkey001' },
        }),
        async () => {
          // rpc 실패 1회 → 재시도 성공 주입
          const c = clients;
          const admin = c.admin as unknown as {
            rpc: (
              fn: string,
              args: Record<string, unknown>,
            ) => Promise<unknown>;
          };
          const originalRpc = admin.rpc.bind(admin);
          admin.rpc = (fn, args) => {
            attempts += 1;
            if (attempts === 1) return Promise.reject(new Error('db down'));
            return originalRpc(fn, args);
          };
          return confirmPaymentAction(
            {
              paymentKey: 'tgen_newkey001',
              orderId: 'ord_1a2b3c4d5e6f',
              amount: 14800,
            },
            c,
          );
        },
      );
      assert.equal(result.success, true);
      assert.equal(attempts, 2, 'markOrderPaid 1회 재시도');
      assert.equal(
        errors.some((args) => args.some((a) => String(a).includes('tgen_new'))),
        true,
        '재시도 실패 시 paymentKey 앞 8자 기록 필요',
      );
      // 성공한 2차 시도는 admin rpc 로 기록된다
      assert.equal(adminRpcRequests.length, 1);
      assert.equal(adminRpcRequests[0].fn, 'rpc_mark_order_paid');
    } finally {
      console.error = originalError;
    }
  });

  it('PENDING 주문에 토스 승인·대조가 정상 동작하면 success 를 반환한다', async () => {
    const { clients, adminRpcRequests } = orderClients(pendingOrderRow());
    const result = await withTossFetch(
      async () => ({
        status: 200,
        json: { ...tossStubResponse(), paymentKey: 'tgen_freshkey' },
      }),
      () =>
        confirmPaymentAction(
          {
            paymentKey: 'tgen_freshkey',
            orderId: 'ord_1a2b3c4d5e6f',
            amount: 14800,
          },
          clients,
        ),
    );
    assert.equal(result.success, true);
    assert.equal(result.success && result.receiptUrl, 'https://receipt.toss/1');
    assert.equal(adminRpcRequests.length, 1);
    assert.equal(adminRpcRequests[0].fn, 'rpc_mark_order_paid');
  });
});
