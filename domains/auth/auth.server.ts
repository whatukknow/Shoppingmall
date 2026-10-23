import { createServerClient } from '@/shared/lib/supabase/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import {
  AuthSessionMissingError,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { Database } from '@/shared/lib/supabase/database.types';
import { toUser } from './users.mapper';
import { hasErrors, validateLogin, validateSignup } from './auth.validate';
import type {
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
} from './auth.types';
import type { User } from './users.types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type OrdersRow = Database['public']['Tables']['orders']['Row'];
type TasteProfilesRow = Database['public']['Tables']['taste_profiles']['Row'];

/** 서버 전용 인증 오류. route handler 가 HTTP 상태로 매핑한다 */
export class AuthApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

const INVALID_CREDENTIAL_MESSAGE = '이메일 또는 비밀번호가 올바르지 않아요.';
const EMAIL_TAKEN_MESSAGE = '이미 가입된 이메일이에요.';
const GENERIC_AUTH_MESSAGE =
  '인증을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
const LOGIN_REQUIRED_MESSAGE = '로그인이 필요해요.';
const EMAIL_FORMAT_MESSAGE = '이메일 형식을 확인해 주세요.';
const INVALID_INPUT_MESSAGE = '입력값을 확인해 주세요.';
const WEAK_PASSWORD_MESSAGE =
  '비밀번호가 너무 약해요. 다른 비밀번호를 입력해 주세요.';
const RATE_LIMIT_MESSAGE = '요청이 많아요. 잠시 후 다시 시도해 주세요.';
const EMAIL_NOT_ALLOWED_MESSAGE = '이 이메일로는 가입할 수 없어요.';

/** Supabase 오류 코드·메시지를 HTTP 상태로 매핑한다 (원문은 로그에만 남긴다) */
function mapAuthError(origin: unknown, tag: string): AuthApiError {
  const e = origin as { code?: string; message?: string; status?: number };
  console.error(
    `${tag} 실패`,
    e?.code ?? '',
    e?.message ?? '',
    e?.status ?? '',
  );

  if (
    e?.code === 'invalid_credentials' ||
    (e?.status === 400 && /invalid login credentials/i.test(e?.message ?? ''))
  ) {
    return new AuthApiError(401, INVALID_CREDENTIAL_MESSAGE);
  }
  if (
    e?.code === 'user_already_exists' ||
    e?.code === 'email_exists' ||
    /already (registered|exists)/i.test(e?.message ?? '')
  ) {
    return new AuthApiError(409, EMAIL_TAKEN_MESSAGE);
  }
  if (e?.code === 'email_address_invalid') {
    return new AuthApiError(400, EMAIL_FORMAT_MESSAGE);
  }
  if (e?.code === 'validation_failed') {
    return new AuthApiError(400, INVALID_INPUT_MESSAGE);
  }
  if (e?.code === 'weak_password') {
    return new AuthApiError(400, WEAK_PASSWORD_MESSAGE);
  }
  if (
    e?.code === 'over_email_send_rate_limit' ||
    e?.code === 'over_request_rate_limit' ||
    e?.status === 429
  ) {
    return new AuthApiError(429, RATE_LIMIT_MESSAGE);
  }
  if (e?.code === 'email_address_not_authorized') {
    return new AuthApiError(400, EMAIL_NOT_ALLOWED_MESSAGE);
  }
  if (e?.code === 'signup_disabled') {
    return new AuthApiError(403, GENERIC_AUTH_MESSAGE);
  }
  return new AuthApiError(500, GENERIC_AUTH_MESSAGE);
}

type AuthUserRef = { id: string; email: string; name: string };

/** auth 스키마(public 타입 직외) auth_users 테이블 Insert 타입 */
type AuthUsersInsert = { id: string; email?: string | null };

/**
/** admin 클라이언트 생성을 실제로 필요할 때까지 미룬다. 실패(예: 시크릿 키 미설정)는 null 로 치환해 응답 계약을 보존한다 */
function resolveAdmin(
  adminClient?: SupabaseClient<Database> | null,
): SupabaseClient<Database> | null {
  if (adminClient) return adminClient;
  try {
    return createAdminClient();
  } catch (e) {
    console.error(
      '관리자 클라이언트 생성 실패',
      (e as { message?: string }).message ?? e,
    );
    return null;
  }
}

/**
 * 관리자 클라이언트(RLS 우회)로 profiles · auth_users 행을 보장한다.
 * 이미 있으면 한 것이 없다 (ignoreDuplicates). 실패는 호출자가 처리한다.
 */
async function ensureProfile(
  admin: SupabaseClient<Database>,
  user: AuthUserRef,
): Promise<void> {
  const upsertOptions = {
    onConflict: 'id',
    ignoreDuplicates: true,
  } as const;
  // database.types 가 Relationships 정의가 없어 insert 인자가 never 로 추론된다 — users.server.ts 와 동일한 any 우회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesQuery = admin.from('profiles') as any;
  const { error: profileError } = await profilesQuery.upsert(
    {
      id: user.id,
      display_name: user.name,
      email: user.email,
    },
    upsertOptions,
  );
  if (profileError) throw profileError;

  // auth_users 는 public 타입 정직외 테이블이므로 최소 타입으로 우회한다
  // (가정): auth_users 는 public 스키마 테이블 — 요구되는 Database 타입 정직외 테이블이므로 최소 타입으로 우회한다
  const authUsersAdmin = admin as unknown as SupabaseClient<{
    public: {
      Tables: {
        auth_users: {
          Row: AuthUsersInsert;
          Insert: AuthUsersInsert;
          Update: Partial<AuthUsersInsert>;
          Relationships: [];
        };
      };
      Views: { [_ in never]: never };
      Functions: { [_ in never]: never };
    };
  }>;
  const { error: authUsersError } = await authUsersAdmin
    .from('auth_users')
    .upsert(
      {
        id: user.id,
        email: user.email,
      },
      upsertOptions,
    );
  if (authUsersError) throw authUsersError;
}

/** 세션 사용자의 profiles 행이 없으면(기존 사용자 · 이전 실패) 관리자 클라이언트로 1회 보정 */
async function ensureProfileIfNeeded(
  client: SupabaseClient<Database>,
  adminClient?: SupabaseClient<Database> | null,
  user?: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
): Promise<{ profile: ProfilesRow | null; adminUnavailable: boolean }> {
  const name =
    typeof user?.user_metadata?.name === 'string'
      ? (user.user_metadata.name as string)
      : '';
  const email = user?.email ?? '';
  const admin = resolveAdmin(adminClient);
  if (!admin) {
    console.error('프로필 보정 실패', '관리자 클라이언트 생성 실패');
    return { profile: null, adminUnavailable: true };
  }
  try {
    if (user) {
      await ensureProfile(admin, {
        id: user.id,
        email,
        name: name,
      });
    }
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error('프로필 보정 실패', err?.code ?? '', err?.message ?? '');
  }
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .maybeSingle();
  return {
    profile: (data ?? null) as ProfilesRow | null,
    adminUnavailable: false,
  };
}

type SessionUser = NonNullable<
  Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']
>;

/** 프로필 · 최근 주문 1건 · 취향 프로필 존재 여부를 한 번에 조회 */
async function loadUserInfo(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<{
  profile: ProfilesRow | null;
  latestOrder: OrdersRow | null;
  hasTasteProfile: boolean;
}> {
  const [profileResult, ordersResult, tasteResult] = await Promise.all([
    client.from('profiles').select('*').eq('id', userId).maybeSingle(),
    client
      .from('orders')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
    client
      .from('taste_profiles')
      .select('id')
      .eq('profile_id', userId)
      .limit(1),
  ]);

  if (profileResult.error || ordersResult.error || tasteResult.error) {
    throw profileResult.error ?? ordersResult.error ?? tasteResult.error;
  }

  return {
    profile: (profileResult.data ?? null) as ProfilesRow | null,
    latestOrder: ((ordersResult.data ?? []) as OrdersRow[])[0] ?? null,
    hasTasteProfile:
      ((tasteResult.data ?? []) as TasteProfilesRow[]).length > 0,
  };
}

/** 최근 주문 주소를 기본 주소 문자열로 합성한다 (없으면 null) */
function composeDefaultAddress(order: OrdersRow | null): string | null {
  if (!order) return null;
  const address = `${order.recipient_address ?? ''} ${
    order.recipient_address_detail ?? ''
  }`.trim();
  return address.length > 0 ? address : null;
}

function assertValidLogin(body: SignInRequest): void {
  const errors = validateLogin(body);
  if (hasErrors(errors)) {
    const first = Object.values(errors)[0] ?? '입력값을 확인해 주세요.';
    throw new AuthApiError(400, first);
  }
}

/** POST auth/signin — 이메일·비밀번호 로그인 */
export async function signIn(
  body: SignInRequest,
  client: SupabaseClient<Database> = createServerClient(),
  adminClient?: SupabaseClient<Database> | null,
): Promise<SignInResponse> {
  assertValidLogin(body);

  const { data, error } = await client.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error) {
    throw mapAuthError(error, '로그인');
  }
  if (!data.session || !data.user) {
    console.error(
      `로그인 실패: Supabase 가 오류 없이 세션·사용자를 빈 값으로 돌려줌 (session=${data.session ? '있음' : '없음'}, user=${data.user ? '있음' : '없음'})`,
    );
    throw new AuthApiError(500, GENERIC_AUTH_MESSAGE);
  }

  const loaded = await loadUserInfo(client, data.user.id);
  let { profile, latestOrder, hasTasteProfile } = loaded;
  let fallbackName = '';
  if (!profile) {
    // 기존 사용자 · 이전 가입 실패 백필: profiles/auth_users 행이 없으면 1회 보정한다
    const refetched = await ensureProfileIfNeeded(client, adminClient, {
      id: data.user.id,
      email: data.user.email ?? body.email,
      user_metadata: data.user.user_metadata,
    });
    // 보정 후 최신 주소 정보를 다시 로드한다
    ({ profile, latestOrder, hasTasteProfile } = await loadUserInfo(
      client,
      data.user.id,
    ));
    fallbackName =
      typeof data.user.user_metadata?.name === 'string'
        ? (data.user.user_metadata.name as string)
        : '';
    profile = refetched.profile;
  }

  return {
    id: data.user.id,
    name: profile?.display_name ?? fallbackName,
    email: profile?.email ?? data.user.email ?? body.email,
    defaultAddress: composeDefaultAddress(latestOrder),
    hasTasteProfile,
    expiresAt: sessionExpiresAt(data.session),
    requestId: crypto.randomUUID(),
  };
}

function assertValidSignup(body: SignUpRequest): void {
  // SignUpRequest 에 passwordConfirm 이 없어 passwordConfirm = password 로 채워
  // 클라이언트 검사기(validateSignup)의 규칙을 그대로 재사용한다
  const errors = validateSignup({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.password,
    agreeTerms: body.agreeTerms,
    agreePrivacy: body.agreePrivacy,
    agreeNotification: body.agreeNotification,
  });

  if (hasErrors(errors)) {
    const first = Object.values(errors)[0] ?? '입력값을 확인해 주세요.';
    throw new AuthApiError(400, first);
  }
}

/** 세션 만료 시각. expires_at 부재는 비정상 세션 이므로 500 */
function sessionExpiresAt(session: { expires_at?: number | null }): string {
  if (
    typeof session.expires_at !== 'number' ||
    Number.isNaN(session.expires_at)
  ) {
    console.error('로그인 실패: 세션 expires_at 부재 — 비정상 세션 발급');
    throw new AuthApiError(500, GENERIC_AUTH_MESSAGE);
  }
  return new Date(session.expires_at * 1000).toISOString();
}

/** POST auth/signup — 이메일·비밀번호 회원가입 (profiles 는 DB 트리거가 생성) */
export async function signUp(
  body: SignUpRequest,
  client: SupabaseClient<Database> = createServerClient(),
  adminClient?: SupabaseClient<Database> | null,
): Promise<SignUpResponse> {
  assertValidSignup(body);

  const { data, error } = await client.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        name: body.name.trim(),
        termsVersion: body.termsVersion,
        privacyVersion: body.privacyVersion,
        agreeTerms: body.agreeTerms,
        agreePrivacy: body.agreePrivacy,
        agreeNotification: body.agreeNotification,
      },
    },
  });
  if (error || !data.user) {
    throw mapAuthError(error, '회원가입');
  }

  // profiles/auth_users 는 INSERT RLS 정책이 없으므로 관리자 클라이언트로만 �다
  const admin = resolveAdmin(adminClient);
  if (admin) {
    try {
      await ensureProfile(admin, {
        id: data.user.id,
        email: data.user.email ?? body.email,
        name: body.name.trim(),
      });
    } catch (e) {
      const err = e as { code?: string; message?: string };
      console.error('프로필 생성 실패', err?.code ?? '', err?.message ?? '');
    }
  } else {
    console.error('프로필 생성 실패', '관리자 클라이언트 생성 실패');
  }

  return {
    id: data.user.id,
    name: body.name.trim(),
    email: data.user.email ?? body.email,
    termsVersion: body.termsVersion,
    privacyVersion: body.privacyVersion,
    agreeTerms: body.agreeTerms,
    agreePrivacy: body.agreePrivacy,
    agreeNotification: body.agreeNotification,
  };
}

/** POST auth/signout — 세션 만료 */
export async function signOut(
  client: SupabaseClient<Database> = createServerClient(),
): Promise<SignOutResponse> {
  const { error } = await client.auth.signOut();
  if (error) {
    throw mapAuthError(error, '로그아웃');
  }
  return { signedOut: true, requestId: crypto.randomUUID() };
}

/** GET users/me — 세션 사용자 정보 (비로그인 401) */
export async function getMe(
  client: SupabaseClient<Database> = createServerClient(),
  adminClient?: SupabaseClient<Database> | null,
): Promise<User> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    const status = (error as { status?: number }).status;
    if (
      error instanceof AuthSessionMissingError ||
      status === 401 ||
      status === 403
    ) {
      console.error(
        '사용자 401: 세션 없음 또는 토큰 무효',
        (error as { code?: string }).code ?? '',
        error.message ?? '',
        status ?? '',
      );
      throw new AuthApiError(401, LOGIN_REQUIRED_MESSAGE);
    }
    console.error(
      '사용자 조회 실패 (서버 오류 → 500)',
      (error as { code?: string }).code ?? '',
      error.message ?? '',
      status ?? '',
    );
    throw new AuthApiError(500, GENERIC_AUTH_MESSAGE);
  }
  if (!data.user) {
    console.error('사용자 조회 실패: 오류 없이 사용자 없음 — 미로그인');
    throw new AuthApiError(401, LOGIN_REQUIRED_MESSAGE);
  }

  const user: SessionUser = data.user;
  let { profile, latestOrder, hasTasteProfile } = await loadUserInfo(
    client,
    user.id,
  );
  if (!profile) {
    const refetched = await ensureProfileIfNeeded(client, adminClient, {
      id: user.id,
      email: user.email ?? '',
      user_metadata: user.user_metadata,
    });
    ({ profile, latestOrder, hasTasteProfile } = await loadUserInfo(
      client,
      user.id,
    ));
    // 관리자 클라이언트 생성 실패(예: 키 미설정)라도 getMe 정상 응답 계약을 유지한다
    if (!profile && refetched.adminUnavailable) {
      const fallbackName =
        typeof user.user_metadata?.name === 'string'
          ? (user.user_metadata.name as string)
          : '';
      return {
        id: user.id,
        name: fallbackName,
        email: user.email ?? '',
        recipientName: '',
        recipientPhone: '',
        postalCode: '',
        recipientAddress: '',
        recipientAddressDetail: '',
        entranceInstructions: '',
        defaultAddress: '',
        hasTasteProfile,
      };
    }
    profile = refetched.profile;
  }
  if (!profile) {
    console.error('profiles 행 없음', user.id);
    throw new AuthApiError(500, GENERIC_AUTH_MESSAGE);
  }

  return toUser(profile, latestOrder, hasTasteProfile);
}
