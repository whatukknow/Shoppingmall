import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getPaymentItems,
  getTasteProfile,
  listMyPayments,
  listMyPodApplications,
  listRecommendedProducts,
  putTasteProfile,
  toTasteProfileId,
} from '../../domains/auth/users.server';
import type { AuthApiError } from '../../domains/auth/auth.server';
import type { TasteProfileRequest } from '../../domains/auth/users.types';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type TasteProfilesRow = Database['public']['Tables']['taste_profiles']['Row'];
type PodsRow = Database['public']['Tables']['pods']['Row'];
type ProductsRow = Database['public']['Tables']['products']['Row'];
type ApplicationRow = Database['public']['Tables']['pod_applications']['Row'];
type ParticipantRow = Database['public']['Tables']['pod_participants']['Row'];
type UploadRow = Database['public']['Tables']['uploads']['Row'];

function tasteProfileRow(
  overrides: Partial<TasteProfilesRow> = {},
): TasteProfilesRow {
  return {
    id: 'tp-1',
    nickname: '정은',
    birth_date: '1995-03-14',
    gender: 'f',
    sunday_scene: 'window-sun',
    fridge_state: 'always-full',
    element: 'wood',
    recommended_product_ids: '["pc-101","pc-102"]',
    created_at: '2026-01-02T00:00:00Z',
    profile_id: 'u-1',
    survey_response_id: 'sr-1',
    code: 'C01',
    ...overrides,
  };
}

function pod(overrides: Partial<PodsRow> & { id: string }): PodsRow {
  return {
    pod_no: 1,
    capacity: 4,
    recruit_deadline_date: null,
    recruit_deadline: '2026-02-01T00:00:00Z',
    portion_label: null,
    member_count: 4,
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

function product(
  overrides: Partial<ProductsRow> & { id: string },
): ProductsRow {
  return {
    gid: `gid-${overrides.id}`,
    name: null,
    product_type: null,
    farm_name: null,
    crop_name: null,
    source_unit: null,
    portion_amount: null,
    portion_unit: null,
    portion_label: null,
    portion_price: null,
    storage_type: null,
    is_fresh: null,
    details: null,
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
    category_id: null,
    ...overrides,
  };
}

function application(
  overrides: Partial<ApplicationRow> & { id: number },
): ApplicationRow {
  return {
    request_type: null,
    status: 'pending',
    reject_reason: null,
    idempotency_key: null,
    requested_at: '2026-01-10T00:00:00Z',
    processed_at: null,
    product_id: 'pc-001',
    requested_pod_id: 'pod-1',
    profile_id: 'u-1',
    ...overrides,
  };
}

function participant(
  overrides: Partial<ParticipantRow> & { id: number },
): ParticipantRow {
  return {
    status: null,
    is_active: true,
    refund_required: null,
    applied_at: '2026-01-10T00:00:00Z',
    payment_ready_at: null,
    paid_at: null,
    cancelled_at: null,
    ended_at: null,
    product_id: 'pc-001',
    pod_id: 'pod-1',
    application_id: 1,
    paid_order_id: null,
    profile_id: 'u-1',
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
  method: 'select' | 'insert' | 'update';
  select?: string;
  onConflict?: string;
  count?: string;
  payload?: unknown;
  filters: { op: string; args: unknown[] }[];
  orders: { column: string; ascending?: boolean }[];
  range: { from: number; to: number } | null;
  limitArg: number | null;
};

type Handler = (req: Request) => { data: unknown; count?: number };

/** Supabase 쿼리 빌더를 흉내 내는 가짜 클라이언트 (podsServer.test.ts 의 엄격 방식 확장판) */
function makeFakeClient(
  handler: Handler,
  auth:
    | { id: string }
    | { error: { code?: string; status?: number; message?: string } } = {
    id: 'u-1',
  },
) {
  const allowedBuilderMethods = new Set([
    'select',
    'eq',
    'neq',
    'in',
    'is',
    'not',
    'order',
    'range',
    'limit',
    'single',
    'maybeSingle',
    'then',
    'update',
    'insert',
    'upsert',
  ]);
  const requests: Request[] = [];
  const client = {
    // 클라이언트 인스턴스에서 분리 호출하면 즉시 throw — this 바인딩 회귀 감지
    auth: {
      getUser: async function (
        this: unknown,
      ): Promise<{ data: object; error: object | null }> {
        if (this !== client.auth) {
          throw new Error(
            '가짜 클라이언트: auth.getUser 는 클라이언트 인스턴스에서 분리 호출할 수 없습니다',
          );
        }
        return 'id' in auth
          ? { data: { user: { id: auth.id } }, error: null }
          : {
              data: { user: null },
              error: { code: 'bad_jwt', message: 'no user', ...auth.error },
            };
      },
    },
    from(table: string) {
      if (this !== client) {
        throw new Error(
          '가짜 클라이언트: from 은 클라이언트 인스턴스에 바인딩해 호출해야 합니다',
        );
      }
      const req: Request = {
        table,
        method: 'select',
        filters: [],
        orders: [],
        range: null,
        limitArg: null,
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
          is(column: string, value: unknown) {
            if (req.orders.length > 0 || req.range) {
              throw new Error(
                `가짜 클라이언트: order/range 이후 is 필터 호출 금지 (@${req.table})`,
              );
            }
            req.filters.push({ op: 'is', args: [column, value] });
            return builder;
          },
          not(column: string, op: string, value: unknown) {
            if (req.orders.length > 0 || req.range) {
              throw new Error(
                `가짜 클라이언트: order/range 이후 not 필터 호출 금지 (@${req.table})`,
              );
            }
            req.filters.push({ op: 'not', args: [column, op, value] });
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
          limit(n: number) {
            req.limitArg = n;
            return builder;
          },
          update(payload: unknown) {
            req.method = 'update';
            req.payload = payload;
            return builder;
          },
          insert(payload: unknown) {
            req.method = 'insert';
            req.payload = payload;
            return builder;
          },
          upsert(payload: unknown, opts?: { onConflict?: string }) {
            req.method = 'insert';
            req.payload = payload;
            req.onConflict = opts?.onConflict;
            return builder;
          },
          then(
            resolve: (r: {
              data: unknown;
              count?: number;
              error: null;
            }) => void,
          ) {
            const result = handler(req);
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
  };
  return {
    client: client as unknown as SupabaseClient<Database>,
    requests,
  };
}

function expect401(error: unknown) {
  const e = error as AuthApiError;
  assert.equal(e.name, 'AuthApiError');
  assert.equal(e.status, 401);
  assert.equal(e.message, '로그인이 필요해요.');
  return true;
}

const authErrorForGuest = { error: { status: 401 } } as const;
// AuthSessionMissingError (세션 없음)는 status 400 — 401 만료가 아니다
const sessionMissingForGuest = {
  error: { name: 'AuthSessionMissingError', status: 400 },
} as const;

describe('getTasteProfile', () => {
  it('본인 taste_profiles 최신 1행을 TasteProfile 로 매핑한다 (birth_date 분해, 없는 필드는 빈 값)', async () => {
    const row = tasteProfileRow();
    const { client, requests } = makeFakeClient((req) =>
      req.table === 'taste_profiles' ? { data: [row] } : { data: null },
    );
    const result = await getTasteProfile(client);
    assert.deepEqual(result, {
      source: '',
      variant: '',
      nickname: '정은',
      birthYear: '1995',
      birthMd: '0314',
      gender: 'f',
      animal: '',
      element: 'wood',
      sunday: 'window-sun',
      fridge: 'always-full',
      items: '[]',
      kit: '[]',
      consent: false,
      qualityFlags: '[]',
    });
    // 원본 행에 없던 필드가 조작되지 않았는지 확인
    assert.equal(row.recommended_product_ids, '["pc-101","pc-102"]');
    assert.equal(requests[0].table, 'taste_profiles');
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'profile_id' && f.args[1] === 'u-1',
      ),
    );
    assert.deepEqual(requests[0].orders, [
      { column: 'created_at', ascending: false },
    ]);
    assert.equal(requests[0].limitArg, 1);
  });

  it('birth_date null 이면 birthYear·birthMd 는 빈 문자열', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'taste_profiles'
        ? { data: [tasteProfileRow({ birth_date: null })] }
        : { data: null },
    );
    const result = await getTasteProfile(client);
    assert.equal(result.birthYear, '');
    assert.equal(result.birthMd, '');
  });

  it('비로그인이면 401 "로그인이 필요해요."', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(getTasteProfile(client), expect401);
  });

  it('행이 없으면 404', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'taste_profiles' ? { data: [] } : { data: null },
    );
    try {
      await getTasteProfile(client);
      assert.fail('404 여야 한다');
    } catch (e) {
      assert.equal((e as AuthApiError).status, 404);
    }
  });
});

describe('putTasteProfile', () => {
  const body: TasteProfileRequest = {
    source: 'onboarding',
    variant: 'v1',
    nickname: '늦잠러',
    birth_year: '1990',
    birth_md: '0307',
    gender: 'f',
    animal: 'wood-pig',
    element: 'wood',
    sunday: 'window-sun',
    fridge: 'always-full',
    items: '[]',
    kit: '[]',
    consent: true,
    quality_flags: '[]',
  };

  const PUT_UUID = '11111111-2222-3333-4444-555555555555';

  it('toTasteProfileId — 결정적 id 길이는 30자 이하(varchar(30)) 이다', () => {
    const id = toTasteProfileId(PUT_UUID);
    assert.ok(id.length <= 30, `id 길이 ${id.length}`);
  });

  it('toTasteProfileId — 같은 입력이면 항상 같은 id 를 반환한다 (결정성)', () => {
    assert.equal(toTasteProfileId(PUT_UUID), toTasteProfileId(PUT_UUID));
  });

  it('toTasteProfileId — 다른 uuid 는 다른 id 를 반환한다', () => {
    const other = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    assert.notEqual(toTasteProfileId(PUT_UUID), toTasteProfileId(other));
  });

  it('toTasteProfileId — uuid 형식이 아니면 throw 한다', () => {
    assert.throws(() => toTasteProfileId('u-1'));
  });

  it('행이 없으면 결정적 id tp_<uid> 로 upsert(onConflict: id) 한다 — birth_date 합성', async () => {
    let inserted = '';
    const { client, requests } = makeFakeClient(
      (req) => {
        if (req.table !== 'taste_profiles') return { data: null };
        if (req.method === 'select')
          return { data: req.filters.length === 0 ? [] : null };
        if (req.method === 'insert') {
          const payload = req.payload as Record<string, unknown>;
          inserted = String(payload.id);
          return {
            data: [tasteProfileRow({ id: inserted, nickname: '늦잠러' })],
          };
        }
        return { data: null };
      },
      { id: PUT_UUID },
    );
    const result = await putTasteProfile(body, client);
    // 동시 PUT 에도 PK 로 1행만 생기도록 결정적 id 를 사용한다
    assert.equal(inserted, toTasteProfileId(PUT_UUID));
    const insertReq = requests.find((r) => r.method === 'insert');
    assert.equal(insertReq?.onConflict, 'id');
    assert.equal(result.nickname, '늦잠러');
    const payload = insertReq?.payload as Record<string, unknown>;
    assert.equal(payload.profile_id, PUT_UUID);
    assert.equal(payload.birth_date, '1990-03-07');
    assert.equal(payload.nickname, '늦잠러');
    assert.equal(payload.element, 'wood');
    assert.equal(payload.sunday_scene, 'window-sun');
    assert.equal(payload.fridge_state, 'always-full');
    assert.equal(payload.gender, 'f');
    // 저장 컬럼 역방향만 — 없는 필드는 건드리지 않는다
    assert.equal(payload.recommended_product_ids, undefined);
    assert.equal(payload.code, undefined);
    assert.equal(payload.survey_response_id, undefined);
  });

  it('동시 2회 PUT 이어도 두 upsert 모두 같은 결정적 id 를 쓴다', async () => {
    const insertedIds: string[] = [];
    const { client } = makeFakeClient(
      (req) => {
        if (req.table !== 'taste_profiles') return { data: null };
        if (req.method === 'select')
          return { data: req.filters.length === 0 ? [] : null };
        if (req.method === 'insert') {
          const payload = req.payload as Record<string, unknown>;
          insertedIds.push(String(payload.id));
          return {
            data: [tasteProfileRow({ id: String(payload.id) })],
          };
        }
        return { data: null };
      },
      { id: PUT_UUID },
    );
    await Promise.all([
      putTasteProfile(body, client),
      putTasteProfile(body, client),
    ]);
    assert.deepEqual(insertedIds, [
      toTasteProfileId(PUT_UUID),
      toTasteProfileId(PUT_UUID),
    ]);
  });

  it('행이 있으면 update 한다', async () => {
    const { client, requests } = makeFakeClient((req) => {
      if (req.table !== 'taste_profiles') return { data: null };
      if (req.method === 'select') return { data: [{ id: 'tp-1' }] };
      if (req.method === 'update') {
        return {
          data: [tasteProfileRow({ nickname: '늦잠러' })],
        };
      }
      return { data: null };
    });
    const result = await putTasteProfile(body, client);
    assert.equal(result.nickname, '늦잠러');
    const updateReq = requests.find((r) => r.method === 'update');
    assert.ok(updateReq);
    assert.equal(
      updateReq.filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'profile_id' && f.args[1] === 'u-1',
      ),
      true,
    );
    const payload = updateReq.payload as Record<string, unknown>;
    assert.equal(payload.nickname, '늦잠러');
    assert.equal(payload.birth_date, '1990-03-07');
    assert.equal(payload.id, undefined);
    assert.equal(payload.recommended_product_ids, undefined);
    assert.equal(payload.code, undefined);
    assert.equal(payload.survey_response_id, undefined);
  });

  it('잘못된 본문이면 400 (nickname 누락)', async () => {
    const { client } = makeFakeClient((req) =>
      req.table === 'taste_profiles'
        ? { data: [tasteProfileRow()] }
        : { data: null },
    );
    try {
      await putTasteProfile(
        { ...body, nickname: 123 as unknown as string },
        client,
      );
      assert.fail('400 여야 한다');
    } catch (e) {
      assert.equal((e as AuthApiError).status, 400);
    }
  });

  it('비로그인이면 401', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(putTasteProfile(body, client), expect401);
  });

  it('비로그인 + 잘못된 본문이면 400 이 아니라 401 이 먼저다', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    try {
      await putTasteProfile(
        { ...body, nickname: 123 as unknown as string },
        client,
      );
      assert.fail('401 여야 한다');
    } catch (e) {
      assert.equal((e as AuthApiError).status, 401);
    }
  });
});

type JoinedApplication = ApplicationRow & {
  pods:
    | (PodsRow & {
        products: {
          name: string;
          gid: string;
          portion_label: string;
          portion_price: number;
        } | null;
      })
    | null;
};

function joinedApplication(
  overrides: Partial<Omit<JoinedApplication, 'pods'>> & {
    pods: NonNullable<JoinedApplication['pods']>;
  },
): JoinedApplication {
  const app = application({ id: 1 });
  return {
    ...app,
    ...overrides,
  } as JoinedApplication;
}

describe('listMyPodApplications', () => {
  const NOW = new Date('2026-01-20T00:00:00Z');

  const appRows: JoinedApplication[] = [
    // ready: participant payment_ready_at 있음, 팟 모집 마감 미경과
    joinedApplication({
      id: 1,
      status: 'accepted',
      requested_at: '2026-01-15T00:00:00Z',
      requested_pod_id: 'pod-1',
      product_id: 'pc-001',
      pods: {
        ...pod({
          id: 'pod-1',
          status: 'recruiting',
          member_count: 2,
          capacity: 4,
          recruit_deadline: '2026-02-01T00:00:00Z',
        }),
        products: {
          name: '참외',
          gid: 'gid-pc-001',
          portion_label: '1팩',
          portion_price: 4900,
        },
      },
    }),
    // expired: payment_ready_at 있음 + payment_due_at 경과
    joinedApplication({
      id: 2,
      status: 'accepted',
      requested_at: '2026-01-14T00:00:00Z',
      requested_pod_id: 'pod-2',
      product_id: 'pc-002',
      pods: {
        ...pod({
          id: 'pod-2',
          status: 'matched',
          member_count: 4,
          capacity: 4,
          payment_due_at: '2026-01-15T00:00:00Z',
        }),
        products: {
          name: '토마토',
          gid: 'gid-pc-002',
          portion_label: '1망',
          portion_price: 7900,
        },
      },
    }),
    // not-ready: participant 없음
    joinedApplication({
      id: 3,
      status: 'pending',
      requested_at: '2026-01-13T00:00:00Z',
      requested_pod_id: 'pod-3',
      product_id: 'pc-003',
      pods: {
        ...pod({
          id: 'pod-3',
          status: 'recruiting',
          member_count: 1,
          capacity: 4,
        }),
        products: {
          name: '멜론',
          gid: 'gid-pc-003',
          portion_label: '1개',
          portion_price: 6500,
        },
      },
    }),
    // paid
    joinedApplication({
      id: 4,
      status: 'accepted',
      requested_at: '2026-01-12T00:00:00Z',
      requested_pod_id: 'pod-4',
      product_id: 'pc-004',
      pods: {
        ...pod({
          id: 'pod-4',
          status: 'closed',
          member_count: 4,
          capacity: 4,
        }),
        products: {
          name: '완두콩',
          gid: 'gid-pc-004',
          portion_label: '200g',
          portion_price: 3200,
        },
      },
    }),
  ];

  const participants: ParticipantRow[] = [
    participant({
      id: 10,
      application_id: 1,
      payment_ready_at: '2026-01-16T00:00:00Z',
      paid_at: null,
    }),
    participant({
      id: 20,
      application_id: 2,
      payment_ready_at: '2026-01-14T00:00:00Z',
      paid_at: null,
    }),
    participant({
      id: 40,
      application_id: 4,
      payment_ready_at: '2026-01-12T00:00:00Z',
      paid_at: '2026-01-13T00:00:00Z',
    }),
  ];

  function handler(req: Request): { data: unknown; count?: number } {
    if (req.table === 'pod_applications') return { data: appRows };
    if (req.table === 'pod_participants') return { data: participants };
    if (req.table === 'uploads')
      return { data: [upload({ gid: 'gid-pc-001', head_img: true })] };
    return { data: null };
  }

  it('pod_applications → MyPodApplication 매핑 규칙 (status·podStatus·quantity·unitPrice)', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPodApplications(
      { status: 'all', sort: 'latest', limit: 0, offset: 0, now: NOW },
      client,
    );
    assert.equal(result.total, 4);
    const byPod = Object.fromEntries(result.list.map((x) => [x.podId, x]));

    // ready
    assert.equal(byPod['pod-1'].status, 'accepted');
    assert.equal(byPod['pod-1'].podStatus, 'recruiting');
    assert.equal(byPod['pod-1'].paymentEligibility, 'ready');
    // expired (payment_due_at 2026-01-15 — 가정: 현재 시각 경과 여부로 판정)
    assert.equal(byPod['pod-2'].podStatus, 'matched');
    assert.equal(byPod['pod-2'].paymentEligibility, 'expired');
    // not-ready (participant 없음)
    assert.equal(byPod['pod-3'].status, 'pending');
    assert.equal(byPod['pod-3'].paymentEligibility, 'not-ready');
    // paid
    assert.equal(byPod['pod-4'].podStatus, 'closed');
    assert.equal(byPod['pod-4'].paymentEligibility, 'paid');
    // 공통 필드
    const first = result.list.find((x) => x.podId === 'pod-1');
    assert.ok(first);
    assert.equal(first.quantity, 1);
    assert.equal(first.unitPrice, 4900);
    assert.equal(first.optionLabel, '1팩');
    assert.equal(first.productName, '참외');
    assert.equal(first.applicantCount, 2);
    assert.equal(first.capacity, 4);
    assert.equal(first.deadlineAt, '2026-02-01T00:00:00Z');
    assert.equal(first.appliedAt, '2026-01-15T00:00:00Z');
    assert.equal(typeof first.id, 'string');
  });

  it('status open 은 pods.status recruiting 만 남긴다', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPodApplications(
      { status: 'open', sort: 'latest', limit: 0, offset: 0, now: NOW },
      client,
    );
    assert.deepEqual(
      result.list.map((x) => x.podId),
      ['pod-1', 'pod-3'],
    );
    assert.equal(result.total, 2);
  });

  it('status close 는 recruiting 이 아닌 것만 남긴다', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPodApplications(
      { status: 'close', sort: 'latest', limit: 0, offset: 0, now: NOW },
      client,
    );
    assert.deepEqual(
      result.list.map((x) => x.podId),
      ['pod-2', 'pod-4'],
    );
  });

  it('latest 정렬은 requested_at 내림차순, limit·offset 적용', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPodApplications(
      { status: 'all', sort: 'latest', limit: 2, offset: 1, now: NOW },
      client,
    );
    assert.deepEqual(
      result.list.map((x) => x.podId),
      ['pod-2', 'pod-3'],
    );
    assert.equal(result.total, 4);
    assert.equal(result.limit, 2);
    assert.equal(result.offset, 1);
  });

  it('participant 는 application_id 로 일괄 조회한다', async () => {
    const { client, requests } = makeFakeClient(handler);
    await listMyPodApplications(
      { status: 'all', sort: 'latest', limit: 0, offset: 0, now: NOW },
      client,
    );
    const partReq = requests.find((r) => r.table === 'pod_participants');
    assert.ok(partReq);
    const partFilter = partReq.filters.find(
      (f) => f.op === 'in' && f.args[0] === 'application_id',
    );
    assert.ok(partFilter);
    assert.deepEqual(partFilter.args[1], [1, 2, 3, 4]);
  });

  it('비로그인이면 401', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(
      listMyPodApplications(
        { status: 'all', sort: 'latest', limit: 0, offset: 0 },
        client,
      ),
      expect401,
    );
  });
});

describe('listMyPayments', () => {
  const orderRow = {
    id: 'ord-1',
    status: 'paid',
    payment_mode: null,
    subtotal: 12800,
    base_shipping_fee: null,
    fresh_packaging_fee: null,
    shipping_fee: 3000,
    discount: 0,
    total: 15800,
    recipient_name: null,
    recipient_phone: null,
    postal_code: null,
    recipient_address: null,
    recipient_address_detail: null,
    entrance_instructions: null,
    payment_method: 'card',
    privacy_consented_at: null,
    privacy_version: null,
    idempotency_key: null,
    created_at: '2026-10-18T12:00:00Z',
    paid_at: '2026-10-18T12:00:01Z',
    profile_id: 'u-1',
  };

  const pendingOrder = {
    ...orderRow,
    id: 'ord-2',
    status: 'pending',
    paid_at: null,
    created_at: '2026-10-19T12:00:00Z',
  };

  function handler(req: Request) {
    if (req.table === 'orders')
      // DB 가 created_at desc 로 정렬해 돌려준다고 가정한 순서
      return { data: [pendingOrder, orderRow] };
    if (req.table === 'order_items')
      return {
        data: [
          {
            id: 'item-1',
            product_name: '용인 블루베리',
            portion_label: null,
            unit_price: 12800,
            image_url: null,
            product_id: 'pc-001',
            pod_id: null,
            participant_id: null,
            order_id: 'ord-1',
          },
          {
            id: 'item-2',
            product_name: '노란 멜론',
            portion_label: null,
            unit_price: 25600,
            image_url: null,
            product_id: 'pc-003',
            pod_id: null,
            participant_id: null,
            order_id: 'ord-2',
          },
        ],
      };
    return { data: null };
  }

  it('본인 orders + order_items 일괄 조회 후 toMyPayment 로 매핑한다', async () => {
    const { client, requests } = makeFakeClient(handler);
    const result = await listMyPayments(
      { status: undefined, limit: 20, offset: 0 },
      client,
    );
    assert.equal(result.total, 2);
    assert.equal(result.list[0].orderId, 'ord-2');
    assert.equal(result.list[0].status, 'pending');
    assert.equal(result.list[1].orderId, 'ord-1');
    assert.equal(result.list[1].status, 'paid');
    assert.equal(result.list[1].itemCount, 1);
    assert.deepEqual(result.list[1].representativeItem, [
      { productName: '용인 블루베리', imageUrl: null },
    ]);
    // orders eq profile_id, created_at desc
    assert.ok(
      requests[0].filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'profile_id' && f.args[1] === 'u-1',
      ),
    );
    assert.deepEqual(requests[0].orders, [
      { column: 'created_at', ascending: false },
    ]);
    // order_items 는 in(order_id) 일괄 조회
    const itemsReq = requests.find((r) => r.table === 'order_items');
    assert.ok(itemsReq);
    const itemFilter = itemsReq.filters.find(
      (f) => f.op === 'in' && f.args[0] === 'order_id',
    );
    assert.ok(itemFilter);
    assert.deepEqual(itemFilter.args[1], ['ord-2', 'ord-1']);
  });

  it('status=paid 필터는 paid 주문만 남긴다', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPayments(
      { status: 'paid', limit: 20, offset: 0 },
      client,
    );
    assert.deepEqual(
      result.list.map((x) => x.orderId),
      ['ord-1'],
    );
    assert.equal(result.total, 1);
  });

  it('limit·offset 적용', async () => {
    const { client } = makeFakeClient(handler);
    const result = await listMyPayments(
      { status: undefined, limit: 1, offset: 1 },
      client,
    );
    assert.deepEqual(
      result.list.map((x) => x.orderId),
      ['ord-1'],
    );
    assert.equal(result.total, 2);
  });

  it('비로그인이면 401', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(
      listMyPayments({ status: undefined, limit: 20, offset: 0 }, client),
      expect401,
    );
  });
});

describe('listRecommendedProducts', () => {
  function handlerWith(profileIds: string, products: ProductsRow[]) {
    return (req: Request): { data: unknown; count?: number } => {
      if (req.table === 'taste_profiles')
        return {
          data: profileIds
            ? [tasteProfileRow({ recommended_product_ids: profileIds })]
            : [],
        };
      if (req.table === 'products') return { data: products };
      if (req.table === 'uploads')
        return { data: [upload({ gid: 'gid-pc-102', head_img: true })] };
      return { data: null };
    };
  }

  const products = [
    product({ id: 'pc-102', name: '유정란 10구' }),
    product({ id: 'pc-101', name: '스테이크용 소고기' }),
    product({ id: 'pc-103', name: '돼지 목살', is_active: false }),
  ];

  it('추천 ID 순서를 유지하고 활성 상품만 조회한다 (limit 적용)', async () => {
    const { client, requests } = makeFakeClient(
      handlerWith('pc-101, pc-102, pc-103', products),
    );
    const result = await listRecommendedProducts({ limit: 2 }, client);
    assert.deepEqual(
      result.list.map((x) => x.id),
      ['pc-101', 'pc-102'],
    );
    assert.ok(result.list[1].imageUrl.length > 0); // pc-102 의 헤더 이미지
    // products in(id) + is_active
    const productReq = requests.find((r) => r.table === 'products');
    assert.ok(productReq);
    const idFilter = productReq.filters.find(
      (f) => f.op === 'in' && f.args[0] === 'id',
    );
    assert.ok(idFilter);
    assert.deepEqual(idFilter.args[1], ['pc-101', 'pc-102', 'pc-103']);
    // 추천 ID 로 조회
    const profileReq = requests[0];
    assert.equal(profileReq.table, 'taste_profiles');
    assert.ok(
      profileReq.filters.some(
        (f) =>
          f.op === 'eq' && f.args[0] === 'profile_id' && f.args[1] === 'u-1',
      ),
    );
  });

  it('프로필이 없으면 빈 목록, products 조회를 건너뛴다', async () => {
    const { client, requests } = makeFakeClient(handlerWith('', products));
    const result = await listRecommendedProducts({ limit: 5 }, client);
    assert.deepEqual(result.list, []);
    assert.equal(result.total, 0);
    assert.equal(
      requests.some((r) => r.table === 'products'),
      false,
    );
  });

  it('추천 ID 가 비어 있으면 빈 목록', async () => {
    const { client, requests } = makeFakeClient(handlerWith('[]', products));
    const result = await listRecommendedProducts({ limit: 5 }, client);
    assert.deepEqual(
      result.list.map((x) => x.id),
      [],
    );
    assert.equal(
      requests.some((r) => r.table === 'products'),
      false,
    );
  });

  it('비로그인이면 401', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(
      listRecommendedProducts({ limit: 5 }, client),
      expect401,
    );
  });
});

describe('getPaymentItems', () => {
  it('본인 참가자(is_active, payment_ready_at not null, paid_at null) → PaymentOrderItem[], 헤더 이미지 헬퍼 사용', async () => {
    const rows = [
      {
        ...participant({ id: 1, pod_id: 'pod-1', product_id: 'pc-001' }),
        pods: {
          ...pod({ id: 'pod-1', product_id: 'pc-001' }),
          products: {
            name: '용인 블루베리',
            gid: 'gid-pc-001',
            portion_label: '1팩 · 125g',
            portion_price: 4900,
          },
        },
      },
    ];
    const { client, requests } = makeFakeClient((req) => {
      if (req.table === 'pod_participants') return { data: rows };
      if (req.table === 'uploads')
        return { data: [upload({ gid: 'gid-pc-001', head_img: true })] };
      return { data: null };
    });
    const result = await getPaymentItems(client);
    assert.deepEqual(result, [
      {
        podId: 'pod-1',
        productName: '용인 블루베리',
        optionLabel: '1팩 · 125g',
        quantity: 1,
        unitPrice: 4900,
        imageUrl: '/uploads/images/test.png',
      },
    ]);
    const req = requests[0];
    assert.equal(req.table, 'pod_participants');
    assert.ok(
      req.filters.some((f) => f.op === 'eq' && f.args[0] === 'is_active'),
    );
    assert.ok(
      req.filters.some(
        (f) => f.op === 'not' && f.args[0] === 'payment_ready_at',
      ),
    );
    assert.ok(
      req.filters.some(
        (f) => f.op === 'is' && f.args[0] === 'paid_at' && f.args[1] === null,
      ),
    );
  });

  it('비로그인이면 401', async () => {
    const { client } = makeFakeClient(
      () => ({ data: null }),
      authErrorForGuest,
    );
    await assert.rejects(getPaymentItems(client), expect401);
  });
});

describe('requireUser 로그 문구', () => {
  it('세션 없음(AuthSessionMissingError, status 400)은 서버 오류 문구 없이 조용히 401', async () => {
    const errors: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    try {
      const { client } = makeFakeClient(
        () => ({ data: null }),
        sessionMissingForGuest,
      );
      await assert.rejects(getTasteProfile(client), expect401);
    } finally {
      console.error = original;
    }
    for (const args of errors) {
      assert.ok(!args.join(' ').includes('서버 오류'));
    }
  });

  it('실제 서버 오류(status 503)는 "사용자 조회 실패 (서버 오류)" 로그를 남기고 500 으로 응답한다', async () => {
    const errors: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    try {
      const { client } = makeFakeClient(() => ({ data: null }), {
        error: { status: 503 },
      });
      await assert.rejects(getTasteProfile(client), (error) => {
        const e = error as AuthApiError;
        assert.equal(e.name, 'AuthApiError');
        assert.equal(e.status, 500);
        assert.equal(
          e.message,
          '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        );
        return true;
      });
    } finally {
      console.error = original;
    }
    assert.ok(
      errors.some((args) =>
        args.join(' ').includes('사용자 조회 실패 (서버 오류)'),
      ),
    );
  });

  it('네트워크 오류(status 없음)도 401 이 아니라 500 으로 응답한다', async () => {
    const { client } = makeFakeClient(() => ({ data: null }), {
      error: { message: 'fetch failed' },
    });
    await assert.rejects(getTasteProfile(client), (error) => {
      const e = error as AuthApiError;
      assert.equal(e.status, 500);
      assert.equal(
        e.message,
        '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      return true;
    });
  });

  it('status 403 도 세션 문제로 401 응답을 유지한다', async () => {
    const { client } = makeFakeClient(() => ({ data: null }), {
      error: { status: 403 },
    });
    await assert.rejects(getTasteProfile(client), expect401);
  });

  it('가짜 클라이언트 auth.getUser 를 분리 호출하면 즉시 throw 한다', async () => {
    const { client } = makeFakeClient(() => ({ data: null }));
    const detached = (
      client.auth as unknown as {
        getUser: () => Promise<unknown>;
      }
    ).getUser;
    await assert.rejects(() => detached(), /분리 호출할 수 없습니다/);
  });
});
