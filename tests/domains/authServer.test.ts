import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// 가짜 클라이언트 기반 테스트 — 실 env 파일을 쓰지 않고 URL 만 격리 주입한다
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co';
import {
  AuthApiError,
  getMe,
  signIn,
  signOut,
  signUp,
} from '../../domains/auth/auth.server';
import type { Database } from '../../shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isSignupAttemptToken,
  SIGNUP_ATTEMPT_METADATA_KEY,
} from '../../domains/auth/auth.types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type OrdersRow = Database['public']['Tables']['orders']['Row'];
type TasteProfilesRow = Database['public']['Tables']['taste_profiles']['Row'];

function profile(id: string): ProfilesRow {
  return {
    id,
    display_name: '정은',
    email: 'user@example.com',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    deleted_at: null,
  };
}

function order(overrides: Partial<OrdersRow> = {}): OrdersRow {
  return {
    id: 'order-1',
    status: 'paid',
    payment_mode: null,
    subtotal: 10000,
    base_shipping_fee: 0,
    fresh_packaging_fee: 0,
    shipping_fee: 3000,
    discount: 0,
    total: 13000,
    recipient_name: '정은',
    recipient_phone: '010-1234-5678',
    postal_code: '06123',
    recipient_address: '서울 강남구 테헤란로 1',
    recipient_address_detail: '101호',
    entrance_instructions: '경비실에 맡겨주세요',
    payment_method: 'card',
    privacy_consented_at: null,
    privacy_version: null,
    idempotency_key: null,
    created_at: '2026-02-01T00:00:00Z',
    paid_at: null,
    profile_id: 'user-1',
    ...overrides,
  };
}

const tasteRow: TasteProfilesRow = {
  id: 'tp-1',
  nickname: null,
  birth_date: null,
  gender: null,
  sunday_scene: null,
  fridge_state: null,
  element: null,
  recommended_product_ids: null,
  created_at: null,
  profile_id: 'user-1',
  survey_response_id: null,
  code: null,
};

type AuthBehavior =
  | { kind: 'ok'; user: AuthUser; session: AuthSession }
  | { kind: 'err'; code?: string; message: string; status?: number }
  | { kind: 'noSession'; user: AuthUser }
  | { kind: 'nullResult' };

type AuthSession = {
  access_token: string;
  expires_at: number | undefined;
};

type AuthUser = {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  identities?: {
    id: string;
    user_id: string;
    identity_id: string;
    provider: string;
  }[];
};

/** DB 쿼리 기록용 요청 */
type DbRequest = {
  table: string;
  filters: { op: string; args: unknown[] }[];
  orders: { column: string; ascending: boolean }[];
  limit: number | null;
};

/** auth + from 쿼리를 흉내 내는 가짜 Supabase 클라이언트 */
function makeFakeClient(options: {
  auth: AuthBehavior;
  signupUser?: AuthUser | ((metadata: Record<string, unknown>) => AuthUser);
  getUserUser?: AuthUser | null;
  getUserError?: { code?: string; message: string; status?: number } | null;
  profiles?: ProfilesRow[];
  orders?: OrdersRow[];
  tasteProfiles?: TasteProfilesRow[];
  signOutError?: boolean | null;
  upsertError?: boolean | null;
}) {
  const upserts: { table: string; payload: unknown; options?: unknown }[] = [];
  const upsertedProfiles = [] as Record<string, unknown>[];
  const requests: DbRequest[] = [];
  let userAgentMetadata: Record<string, unknown> | undefined;

  const auth = {
    async signInWithPassword(body: { email: string; password: string }) {
      lastSignInBody = body;
      const a = options.auth;
      if (a.kind === 'ok')
        return { data: { user: a.user, session: a.session }, error: null };
      if (a.kind === 'err')
        return {
          data: { user: null, session: null },
          error: {
            code: a.code ?? 'unexpected',
            message: a.message,
            status: a.status,
          },
        };
      if (a.kind === 'noSession') {
        return {
          data: { user: null, session: null },
          error: { code: 'unexpected', message: 'no session' },
        };
      }
      if (a.kind === 'nullResult') {
        return { data: { user: null, session: null }, error: null };
      }
      return {
        data: { user: null, session: null },
        error: { code: 'unexpected', message: 'unknown' },
      };
    },
    async signUp(body: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      lastSignUpBody = body;
      userAgentMetadata = body.options?.data;
      const errAuth = options.auth;
      if (errAuth.kind === 'err') {
        return {
          data: { user: null, session: null },
          error: {
            code: errAuth.code,
            message: errAuth.message,
            status: errAuth.status,
          },
        };
      }
      const a = options.auth;
      const signupUser =
        typeof options.signupUser === 'function'
          ? options.signupUser(body.options?.data ?? {})
          : options.signupUser;
      if (a.kind === 'noSession') {
        return {
          data: { user: signupUser ?? a.user, session: null },
          error: null,
        };
      }
      if (a.kind === 'ok') {
        return {
          data: { user: signupUser ?? a.user, session: a.session },
          error: null,
        };
      }
      return { data: { user: null, session: null }, error: null };
    },
    async signOut() {
      if (options.signOutError) {
        return { error: { code: 'unexpected', message: 'signout failed' } };
      }
      return { error: null };
    },
    async getUser() {
      if (options.getUserError) {
        return { data: { user: null }, error: options.getUserError };
      }
      if (options.getUserUser) {
        return { data: { user: options.getUserUser }, error: null };
      }
      return { data: { user: null }, error: null };
    },
  };

  let lastSignInBody: { email: string; password: string } | null = null;
  let lastSignUpBody: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  } | null = null;

  const client = {
    auth,
    from(table: string) {
      const req: DbRequest = { table, filters: [], orders: [], limit: null };
      requests.push(req);
      const builder: unknown = {
        select() {
          return builder;
        },
        eq(column: string, value: unknown) {
          req.filters.push({ op: 'eq', args: [column, value] });
          return builder;
        },
        order(column: string, opts?: { ascending?: boolean }) {
          req.orders.push({ column, ascending: opts?.ascending ?? true });
          return builder;
        },
        limit(n: number) {
          req.limit = n;
          return builder;
        },
        async upsert(payload: unknown, upsertOptions?: unknown) {
          upserts.push({ table, payload, options: upsertOptions });
          if (
            table === 'profiles' &&
            typeof payload === 'object' &&
            payload !== null &&
            'id' in payload
          ) {
            upsertedProfiles.push(payload as Record<string, unknown>);
          }
          if (options.upsertError) {
            return {
              data: null,
              error: { code: 'insert_fail', message: 'upsert failed' },
            };
          }
          return { data: null, error: null };
        },
        maybeSingle() {
          return builder;
        },
        then(resolve: (r: { data: unknown; error: null }) => void) {
          if (table === 'profiles') {
            const all = [
              ...((options.profiles ?? []) as ProfilesRow[]),
              ...(upsertedProfiles as unknown as ProfilesRow[]),
            ];
            const data =
              all.find((p) =>
                req.filters.some(
                  (f) =>
                    f.op === 'eq' && f.args[0] === 'id' && f.args[1] === p.id,
                ),
              ) ?? null;
            resolve({ data, error: null });
            return undefined;
          }
          if (table === 'orders') {
            const pid = req.filters.find(
              (f) => f.op === 'eq' && f.args[0] === 'profile_id',
            )?.args[1];
            const data =
              options.orders?.filter((o) => o.profile_id === pid) ?? [];
            resolve({ data, error: null });
            return undefined;
          }
          if (table === 'taste_profiles') {
            const pid = req.filters.find(
              (f) => f.op === 'eq' && f.args[0] === 'profile_id',
            )?.args[1];
            const data =
              options.tasteProfiles?.filter((t) => t.profile_id === pid) ?? [];
            resolve({ data, error: null });
            return undefined;
          }
          resolve({ data: null, error: null });
          return undefined;
        },
      };
      return builder;
    },
    _requests: requests,
    _lastSignInBody: () => lastSignInBody,
    _lastSignUpBody: () => lastSignUpBody,
    _userAgentMetadata: () => userAgentMetadata,
    _upserts: upserts,
  } as unknown as SupabaseClient<Database> & {
    _requests: DbRequest[];
    _lastSignInBody: () => { email: string; password: string } | null;
    _lastSignUpBody: () => {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    } | null;
    _userAgentMetadata: () => Record<string, unknown> | undefined;
    _upserts: { table: string; payload: unknown; options?: unknown }[];
  };

  return client;
}

const authUser: AuthUser = {
  id: 'user-1',
  email: 'user@example.com',
};

const authSession: AuthSession = {
  access_token: 'token',
  expires_at: 1762000000,
};

const signupRequest = {
  name: '정은',
  email: 'user@example.com',
  password: 'password123',
  termsVersion: '2026-10',
  privacyVersion: '2026-10',
  agreeTerms: true,
  agreePrivacy: true,
  agreeNotification: false,
};

const signedInOptions = {
  auth: { kind: 'ok' as const, user: authUser, session: authSession },
  profiles: [profile('user-1')],
  orders: [order()],
  tasteProfiles: [tasteRow],
};

describe('auth.server signIn', () => {
  it('검증에 통과하면 Supabase signInWithPassword 를 호출한다', async () => {
    const client = makeFakeClient(signedInOptions);
    await signIn({ email: 'user@example.com', password: 'pw123456' }, client);
    assert.deepEqual(client._lastSignInBody(), {
      email: 'user@example.com',
      password: 'pw123456',
    });
  });

  it('로그인 응답에 프로필·최근 주류 주소·취향 여부를 채운다', async () => {
    const client = makeFakeClient(signedInOptions);
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '정은');
    assert.equal(res.email, 'user@example.com');
    assert.equal(res.hasTasteProfile, true);
    assert.equal(res.expiresAt, new Date(1762000000 * 1000).toISOString());
    assert.equal(typeof res.requestId, 'string');
  });

  it('최근 주문이 있으면 주문 주소를 defaultAddress 로 합성한다', async () => {
    const client = makeFakeClient(signedInOptions);
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.defaultAddress, '서울 강남구 테헤란로 1 101호');
  });

  it('최근 주문이 없으면 defaultAddress 는 null', async () => {
    const client = makeFakeClient({ ...signedInOptions, orders: [] });
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.defaultAddress, null);
  });

  it('취향 프로필이 없으면 hasTasteProfile 은 false', async () => {
    const client = makeFakeClient({ ...signedInOptions, tasteProfiles: [] });
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.hasTasteProfile, false);
  });

  it('잘못된 자격 증명이면 401 로 매핑한다', async () => {
    const client = makeFakeClient({
      auth: {
        kind: 'err',
        code: 'invalid_credentials',
        message: 'Invalid login credentials',
      },
    });
    await assert.rejects(
      signIn({ email: 'user@example.com', password: 'wrong' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 401);
        assert.notEqual(e.message, 'Invalid login credentials');
        return true;
      },
    );
  });

  it('이메일 형식 400 메시지는 클라이언트 검사기와 동일하다 (W-4)', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signIn({ email: 'not-an-email', password: 'pw123456' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        assert.equal(e.message, 'Enter a valid email address.');
        return true;
      },
    );
  });

  it('이메일 형식이 아니면 400', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signIn({ email: 'not-an-email', password: 'pw123456' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
  });

  it('password 가 비어 있으면 400', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signIn({ email: 'user@example.com', password: '' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
  });

  it('error 가 null 인데 session·user 가 모두 없으면 500 으로 매핑한다 (W-6)', async () => {
    const client = makeFakeClient({ auth: { kind: 'nullResult' } });
    await assert.rejects(
      signIn({ email: 'user@example.com', password: 'pw123456' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 500);
        return true;
      },
    );
  });

  it('session.expires_at 이 없으면 500 으로 매핑하고 1970 시각을 돌려주지 않는다 (W-5)', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'ok',
        user: authUser,
        session: { access_token: 'token', expires_at: undefined },
      },
    });
    await assert.rejects(
      signIn({ email: 'user@example.com', password: 'pw123456' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 500);
        return true;
      },
    );
  });

  it('그 외 Supabase 오류는 500 으로 매핑한다', async () => {
    const client = makeFakeClient({
      auth: { kind: 'err', code: 'boom', message: 'raw secret failure' },
    });
    await assert.rejects(
      signIn({ email: 'user@example.com', password: 'pw123456' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 500);
        assert.notEqual(e.message, 'raw secret failure');
        return true;
      },
    );
  });
});

describe('auth.server signUp', () => {
  it('필수 약관·이메일·비밀번호로 Supabase signUp 을 호출한다', async () => {
    const client = makeFakeClient(signedInOptions);
    await signUp(signupRequest, client);
    const body = client._lastSignUpBody();
    assert.ok(body);
    assert.equal(body.email, 'user@example.com');
    assert.equal(body.password, 'password123');
    assert.ok(
      isSignupAttemptToken(body.options?.data?.[SIGNUP_ATTEMPT_METADATA_KEY]),
    );
    const { [SIGNUP_ATTEMPT_METADATA_KEY]: _token, ...metadata } =
      body.options?.data ?? {};
    assert.ok(_token);
    assert.deepEqual(metadata, {
      name: '정은',
      termsVersion: '2026-10',
      privacyVersion: '2026-10',
      agreeTerms: true,
      agreePrivacy: true,
      agreeNotification: false,
    });
  });

  it('가입 응답을 SignUpResponse 로 돌려준다', async () => {
    const client = makeFakeClient(signedInOptions);
    const res = await signUp(signupRequest, client);
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '정은');
    assert.equal(res.email, 'user@example.com');
    assert.equal(res.termsVersion, '2026-10');
    assert.equal(res.privacyVersion, '2026-10');
    assert.equal(res.agreeTerms, true);
    assert.equal(res.agreePrivacy, true);
    assert.equal(res.agreeNotification, false);
  });

  it('이미 가입된 email 이면 409 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'user_already_exists',
        message: 'User already registered',
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 409);
      assert.notEqual(e.message, 'User already registered');
      return true;
    });
  });

  it('필수 약관이 false 면 400', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signUp({ ...signupRequest, agreeTerms: false }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
    await assert.rejects(
      signUp({ ...signupRequest, agreePrivacy: false }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
  });

  it('이메일 형식이 아니면 400', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signUp({ ...signupRequest, email: 'nope' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
  });

  it('password 8자 미만이면 400 이고 메시지는 클라이언트 검사기와 동일하다 (W-4)', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signUp({ ...signupRequest, password: 'short' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        assert.equal(e.message, 'Use at least 8 characters for your password.');
        return true;
      },
    );
  });

  it('이메일 형식 400 메시지는 클라이언트 검사기와 동일하다 (W-4)', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signUp({ ...signupRequest, email: 'nope' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        assert.equal(e.message, 'Enter a valid email address.');
        return true;
      },
    );
  });

  it('이름이 비어 있으면 400', async () => {
    const client = makeFakeClient(signedInOptions);
    await assert.rejects(
      signUp({ ...signupRequest, name: '   ' }, client),
      (e: unknown) => {
        assert.ok(e instanceof AuthApiError);
        assert.equal(e.status, 400);
        return true;
      },
    );
  });

  it('email_address_invalid 는 400 "Enter a valid email address." 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'email_address_invalid',
        message: 'Email address is invalid',
        status: 400,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 400);
      assert.equal(e.message, 'Enter a valid email address.');
      return true;
    });
  });

  it('validation_failed 는 400 "Please check your details." 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'validation_failed',
        message: 'Validation failed',
        status: 422,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 400);
      assert.equal(e.message, 'Please check your details.');
      return true;
    });
  });

  it('weak_password 는 400 "비밀번호가 너무 약해요..." 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'weak_password',
        message: 'Password is too weak',
        status: 422,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 400);
      assert.equal(e.message, 'Choose a stronger password.');
      return true;
    });
  });

  it('over_email_send_rate_limit 는 429 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'over_email_send_rate_limit',
        message: 'Email rate limit exceeded',
        status: 429,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 429);
      assert.equal(e.message, 'Too many requests. Please try again shortly.');
      return true;
    });
  });

  it('over_request_rate_limit 는 429 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'over_request_rate_limit',
        message: 'Request rate limit exceeded',
        status: 429,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 429);
      assert.equal(e.message, 'Too many requests. Please try again shortly.');
      return true;
    });
  });

  it('code 없이 status 429 인 오류도 429 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        message: 'Too many requests',
        status: 429,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 429);
      assert.equal(e.message, 'Too many requests. Please try again shortly.');
      return true;
    });
  });

  it('email_address_not_authorized 는 400 "You cannot sign up with this email address." 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'email_address_not_authorized',
        message: 'Email address not authorized',
        status: 400,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 400);
      assert.equal(e.message, 'You cannot sign up with this email address.');
      return true;
    });
  });

  it('signup_disabled 는 403 으로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: {
        kind: 'err',
        code: 'signup_disabled',
        message: 'Signups not allowed',
        status: 403,
      },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 403);
      return true;
    });
  });

  it('그 외 오류는 500 으로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      auth: { kind: 'err', code: 'boom', message: 'raw secret failure' },
    });
    await assert.rejects(signUp(signupRequest, client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 500);
      assert.notEqual(e.message, 'raw secret failure');
      return true;
    });
  });
});

describe('가입 분석 표식의 인증 완료 경계', () => {
  const identity = {
    id: authUser.id,
    user_id: authUser.id,
    identity_id: 'synthetic-identity',
    provider: 'email',
  };

  it('신규·기존 은닉·미확인 재전송·알 수 없는 성공 모두 동일한 공개 응답 형태를 유지한다', async () => {
    const shapes: string[][] = [];
    for (const kind of ['new', 'obfuscated', 'resend', 'unknown']) {
      const client = makeFakeClient({
        ...signedInOptions,
        signupUser(metadata) {
          if (kind === 'unknown') return authUser;
          return {
            ...authUser,
            user_metadata:
              kind === 'resend'
                ? { [SIGNUP_ATTEMPT_METADATA_KEY]: 'old-attempt' }
                : metadata,
            identities: kind === 'obfuscated' ? [] : [identity],
          };
        },
      });
      const response = await signUp(signupRequest, client);
      assert.ok(isSignupAttemptToken(response.signupAttemptToken));
      assert.equal(
        response.signupAttemptToken,
        client._lastSignUpBody()?.options?.data?.[SIGNUP_ATTEMPT_METADATA_KEY],
      );
      assert.equal('signUpAnalyticsEligible' in response, false);
      shapes.push(Object.keys(response).sort());
    }
    shapes.forEach((shape) => assert.deepEqual(shape, shapes[0]));
  });

  it('이 요청에서 생성된 표식과 실제 이메일 identity가 인증 후 일치할 때만 승인한다', async () => {
    const createdUser: AuthUser = { ...authUser, identities: [identity] };
    const client = makeFakeClient({
      ...signedInOptions,
      auth: { kind: 'ok', user: createdUser, session: authSession },
      signupUser(metadata) {
        createdUser.user_metadata = metadata;
        return createdUser;
      },
    });
    const signup = await signUp(signupRequest, client);
    const response = await signIn(
      {
        email: signupRequest.email,
        password: signupRequest.password,
        signupAttemptToken: signup.signupAttemptToken,
      },
      client,
    );
    assert.equal(response.signUpAnalyticsEligible, true);
    assert.deepEqual(client._lastSignInBody(), {
      email: signupRequest.email,
      password: signupRequest.password,
    });
    assert.equal(
      client._requests.length,
      3,
      '기존 로그인 정보 조회 외 추가 쿼리 없음',
    );
  });

  it('기존 계정 은닉 응답의 요청 메타데이터가 실제 인증 계정의 표식으로 쓰이지 않는다', async () => {
    const existing: AuthUser = {
      ...authUser,
      user_metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: crypto.randomUUID() },
      identities: [identity],
    };
    const client = makeFakeClient({
      ...signedInOptions,
      auth: { kind: 'ok', user: existing, session: authSession },
      signupUser: (metadata) => ({
        ...authUser,
        id: 'obfuscated-id',
        user_metadata: metadata,
        identities: [],
      }),
    });
    const signup = await signUp(signupRequest, client);
    const response = await signIn(
      {
        email: signupRequest.email,
        password: signupRequest.password,
        signupAttemptToken: signup.signupAttemptToken,
      },
      client,
    );
    assert.equal(response.signUpAnalyticsEligible, undefined);
    assert.equal(response.id, existing.id);
  });

  it('미확인 기존 가입의 재전송은 새 요청 표식과 일치하지 않는다', async () => {
    const existing: AuthUser = {
      ...authUser,
      user_metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: crypto.randomUUID() },
      identities: [identity],
    };
    const client = makeFakeClient({
      ...signedInOptions,
      auth: { kind: 'ok', user: existing, session: authSession },
    });
    const signup = await signUp(signupRequest, client);
    const response = await signIn(
      {
        email: signupRequest.email,
        password: signupRequest.password,
        signupAttemptToken: signup.signupAttemptToken,
      },
      client,
    );
    assert.equal(response.signUpAnalyticsEligible, undefined);
  });

  it('표식/identity가 없거나 형식·소유자가 다르면 정상 로그인은 유지하고 분석은 보류한다', async () => {
    const token = crypto.randomUUID();
    const fixtures: {
      token?: unknown;
      metadata?: Record<string, unknown>;
      identities?: AuthUser['identities'];
    }[] = [
      {},
      {
        token: 'malformed',
        metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: 'malformed' },
        identities: [identity],
      },
      { token, identities: [identity] },
      { token, metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: token } },
      {
        token,
        metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: token },
        identities: [],
      },
      {
        token,
        metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: token },
        identities: [
          null as unknown as NonNullable<AuthUser['identities']>[number],
        ],
      },
      {
        token,
        metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: token },
        identities: [{ ...identity, user_id: 'someone-else' }],
      },
      {
        token,
        metadata: { [SIGNUP_ATTEMPT_METADATA_KEY]: token },
        identities: [{ ...identity, provider: 'github' }],
      },
    ];
    for (const fixture of fixtures) {
      const client = makeFakeClient({
        ...signedInOptions,
        auth: {
          kind: 'ok',
          user: {
            ...authUser,
            user_metadata: fixture.metadata,
            identities: fixture.identities,
          },
          session: authSession,
        },
      });
      const response = await signIn(
        {
          email: signupRequest.email,
          password: signupRequest.password,
          signupAttemptToken: fixture.token as string | undefined,
        },
        client,
      );
      assert.equal(response.id, authUser.id);
      assert.equal(response.signUpAnalyticsEligible, undefined);
    }
  });
});

describe('auth.server signOut', () => {
  it('signedOut true 와 requestId 를 돌려준다', async () => {
    const client = makeFakeClient(signedInOptions);
    const res = await signOut(client);
    assert.equal(res.signedOut, true);
    assert.equal(typeof res.requestId, 'string');
  });

  it('로그아웃이 실패하면 500 으로 매핑한다', async () => {
    const client = makeFakeClient({ ...signedInOptions, signOutError: true });
    await assert.rejects(signOut(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 500);
      return true;
    });
  });
});

describe('auth.server getMe', () => {
  it('세션이 있으면 toUser 결과를 돌려준다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserUser: authUser,
    });
    const res = await getMe(client);
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '정은');
    assert.equal(res.email, 'user@example.com');
    assert.equal(res.defaultAddress, '서울 강남구 테헤란로 1 101호');
    assert.equal(res.recipientName, '정은');
    assert.equal(res.postalCode, '06123');
    assert.equal(res.hasTasteProfile, true);
  });

  it('비로그인이면 401 로 매핑한다', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserUser: null,
    });
    await assert.rejects(getMe(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 401);
      return true;
    });
  });

  it('getUser 오류가 세션 없음(status 401)이면 401 을 던진다 (W-7)', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserError: { message: 'Missing or invalid session', status: 401 },
    });
    await assert.rejects(getMe(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 401);
      return true;
    });
  });

  it('getUser 오류 status 403 도 401 을 던진다 (W-7)', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserError: { message: 'forbidden', status: 403 },
    });
    await assert.rejects(getMe(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 401);
      return true;
    });
  });

  it('getUser 오류가 서버 오류(status 500)면 500 을 던진다 (W-7)', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserError: { code: 'boom', message: 'upstream down', status: 500 },
    });
    await assert.rejects(getMe(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 500);
      return true;
    });
  });

  it('getUser 오류에 status 가 없는 일반 오류는 500 을 던진다 (W-7)', async () => {
    const client = makeFakeClient({
      ...signedInOptions,
      getUserError: { code: 'network', message: 'fetch failed' },
    });
    await assert.rejects(getMe(client), (e: unknown) => {
      assert.ok(e instanceof AuthApiError);
      assert.equal(e.status, 500);
      return true;
    });
  });

  it('profiles 행이 없으면 관리자 없이 adminUnavailable 폴백 계약 응답을 유지한다', async () => {
    const client = makeFakeClient({
      auth: {
        kind: 'ok',
        user: { ...authUser, user_metadata: { name: '보정이름' } },
        session: authSession,
      },
      orders: [],
      tasteProfiles: [],
      getUserUser: { ...authUser, user_metadata: { name: '보정이름' } },
    });
    const res = await getMe(client);
    assert.equal(client._upserts.length, 0, 'auth 서버는 upsert 하지 않는다');
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '보정이름');
    assert.equal(res.email, 'user@example.com');
    assert.equal(res.recipientName, '');
    assert.equal(res.defaultAddress, '');
    assert.equal(res.hasTasteProfile, false);
  });

  it('auth 경로는 관리자 클라이언트를 만들지 않는다 (signUp·signIn·getMe 공통)', async () => {
    const client = makeFakeClient({
      auth: { kind: 'ok', user: authUser, session: authSession },
      orders: [],
      tasteProfiles: [],
      getUserUser: authUser,
    });
    await signUp(signupRequest, client);
    await signIn({ email: 'user@example.com', password: 'pw123456' }, client);
    await getMe(client);
    assert.equal(client._upserts.length, 0);
  });
});

describe('auth.server 관리자 없는 프로필 계약', () => {
  it('profiles 행이 있으면 어떤 보정 upsert 도 호출하지 않는다', async () => {
    const client = makeFakeClient({
      auth: {
        kind: 'ok',
        user: { ...authUser, user_metadata: { name: '정은' } },
        session: authSession,
      },
      profiles: [profile('user-1')],
      orders: [],
      tasteProfiles: [],
    });
    await signIn({ email: 'user@example.com', password: 'pw123456' }, client);
    assert.equal(client._upserts.length, 0);
  });

  it('signIn: profile 없음이면 정상 응답(name 은 user_metadata.name) 을 유지한다', async () => {
    const client = makeFakeClient({
      auth: {
        kind: 'ok',
        user: { ...authUser, user_metadata: { name: '보정이름' } },
        session: authSession,
      },
      orders: [],
      tasteProfiles: [],
    });
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '보정이름');
    assert.equal(client._upserts.length, 0);
  });

  it('signIn: metadata.name 도 profile 도 없으면 name 은 빈 문자열이지만 응답은 성공이다', async () => {
    const client = makeFakeClient({
      auth: { kind: 'ok', user: authUser, session: authSession },
      orders: [],
      tasteProfiles: [],
    });
    const res = await signIn(
      { email: 'user@example.com', password: 'pw123456' },
      client,
    );
    assert.equal(res.id, 'user-1');
    assert.equal(res.email, 'user@example.com');
    assert.equal(res.name, '');
  });

  it('profiles 행이 없으면 보정 upsert 를 호출하지 않는다 (signUp 포함)', async () => {
    const client = makeFakeClient({
      auth: { kind: 'ok', user: authUser, session: authSession },
      upsertError: true,
    });
    const res = await signUp(signupRequest, client);
    assert.equal(res.id, 'user-1');
    assert.equal(res.name, '정은');
    assert.equal(client._upserts[0]?.table, undefined);
    assert.equal(client._upserts.length, 0);
  });
});
