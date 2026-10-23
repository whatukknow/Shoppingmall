import { createServerClient } from '@/shared/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/lib/supabase/database.types';
import { getPod, PodWriteError } from './pods.server';
import type { Pod } from './pods.types';

/** route handler 용 재노출 */
export { PodWriteError };

/** 실DB RPC 기반 팟 쓰기. CAS·보상 로직은 DB 함수 내부로 이관되어 앱에는 없다. */

/** RPC 오류 메시지 접두 코드별 고정 화면용 문구 (DB 원문은 노출하지 않는다) */
const POD_RPC_MESSAGES: Record<string, string> = {
  POD_NOT_FOUND: '팟을 찾을 수 없어요.',
  PRODUCT_NOT_FOUND: '상품을 찾을 수 없어요.',
  NOT_A_MEMBER: '이 팟의 참여자가 아니에요.',
  PRODUCT_INACTIVE: '판매가 중단된 상품이에요.',
  INVALID_CAPACITY: '모집 정원은 2명 이상 50명 이하로 설정해 주세요.',
  INVALID_DEADLINE: '모집 마감일은 오늘 이후로 설정해 주세요.',
  NOT_RECRUITING: '모집 중인 팟이 아니에요.',
  DEADLINE_PASSED: '모집 마감 시간이 지났어요.',
  ALREADY_JOINED: '이미 참여 중인 팟이에요.',
  POD_FULL: '모집 정원이 가득 찼어요.',
  ALREADY_PAID: '결제가 완료된 팟은 취소할 수 없어요.',
  IDEMPOTENCY_KEY_CONFLICT:
    '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
  INTERNAL_CONFLICT: '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
};

const INTERNAL_MESSAGE =
  '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';

/** rpc 오류를 HTTP 상태·사용자 메시지로 매핑한다. 원문은 console.error 에만 남긴다 */
function mapPodRpcError(origin: unknown, tag: string): PodWriteError {
  const e = origin as { code?: string; message?: string };
  console.error(`${tag} 실패`, e?.code ?? '', e?.message ?? '');

  if (e?.code === '28000') return new PodWriteError(401, '로그인이 필요해요.');
  const message = e?.message ?? '';
  const prefix = message.split(':')[0]?.trim() ?? '';
  for (const [code, msg] of Object.entries(POD_RPC_MESSAGES)) {
    if (prefix === code) {
      const notFound = code === 'NOT_A_MEMBER' || code.endsWith('_NOT_FOUND');
      return new PodWriteError(notFound ? 404 : 409, msg);
    }
  }
  // errcode 만 있는 경우: P0002 는 없음(404), 그 외 업무 오류(P0001)·기타는 500
  if (e?.code === 'P0002') {
    return new PodWriteError(404, '대상을 찾을 수 없어요.');
  }
  return new PodWriteError(500, INTERNAL_MESSAGE);
}

/** 쓰기 RPC 진입 전 세션 확인 — 세션 없으면 RPC 호출 없이 401 */
async function requirePodUser(client: SupabaseClient<Database>): Promise<void> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    console.error(
      '팟 쓰기 로그인 세션 없음 → 401',
      (error as { code?: string } | null)?.code ?? '',
      error?.message ?? '',
    );
    throw new PodWriteError(401, '로그인이 필요해요.');
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** POST pods/:id/applications 멱등 키: 헤더 uuid 값, 없거나 형식이 틀리면 새로 발급 */
export function resolveIdempotencyKey(raw: string | null | undefined): string {
  if (raw && UUID_RE.test(raw)) return raw;
  return crypto.randomUUID();
}

/** targetCount 는 정수 2~50, deadline 은 YYYY-MM-DD 실재 날짜 */
function validatePodCreateBody(body: {
  targetCount: number;
  deadline: string;
}) {
  const { targetCount, deadline } = body;
  if (
    typeof targetCount !== 'number' ||
    !Number.isInteger(targetCount) ||
    targetCount < 2 ||
    targetCount > 50
  ) {
    return '모집 정원은 2명 이상 50명 이하로 설정해 주세요.';
  }
  if (typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return '모집 마감일 형식이 올바르지 않아요. (YYYY-MM-DD)';
  }
  const parsed = new Date(`${deadline}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== deadline
  ) {
    return '모집 마감일이 올바르지 않아요.';
  }
  return null;
}

/** rpc 실행 공통: 오류는 매핑해 PodWriteError 로 던진다 */
async function callPodRpc(
  client: SupabaseClient<Database>,
  fn: string,
  args: Record<string, unknown>,
  tag: string,
): Promise<{ podId: string }> {
  // (가정) Database 타입에 rpc 함수 시그니처가 등록되어 있지 않아 인자를 Record 로 전달한다.
  // 반드시 client 인스턴스에 바인딩해 호출한다 — 분리 호출하면 this 유실로 런타임 오류
  const rpc = client.rpc as unknown as (
    this: SupabaseClient<Database>,
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown }>;
  const { data, error } = await rpc.call(client, fn, args);
  if (error) throw mapPodRpcError(error, tag);
  const result = (data ?? {}) as { podId?: string; id?: string };
  const podId = result.podId ?? result.id ?? '';
  if (!podId) {
    console.error(`${tag} 실패`, 'rpc 응답에 podId 없음', data);
    throw new PodWriteError(500, INTERNAL_MESSAGE);
  }
  return { podId };
}

/** POST products/:id/pods — 새 소분팟을 생성하고 생성된 팟을 돌려준다 */
export async function createPod(
  productId: string,
  body: { targetCount: number; deadline: string },
  client: SupabaseClient<Database> = createServerClient(),
): Promise<Pod> {
  const invalid = validatePodCreateBody(body);
  if (invalid) throw new PodWriteError(400, invalid);
  await requirePodUser(client);

  const { podId } = await callPodRpc(
    client,
    'rpc_create_pod',
    {
      p_product_id: productId,
      p_capacity: body.targetCount,
      p_deadline: body.deadline,
    },
    '소분팟 생성',
  );
  // RPC 이후 실제 pods 행을 재조회해 화면 Pod 로 돌려준다
  return getPod(podId, client);
}

/** POST pods/:podId/applications — 팟 참여를 신청하고 갱신된 팟을 돌려준다 */
export async function applyPod(
  podId: string,
  idempotencyKey: string,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<Pod> {
  await requirePodUser(client);
  await callPodRpc(
    client,
    'rpc_apply_pod',
    { p_pod_id: podId, p_idempotency_key: idempotencyKey },
    '소분팟 참여 신청',
  );
  return getPod(podId, client);
}

/** DELETE pods/:podId/applications/me — 참여 신청을 취소하고 갱신된 팟을 돌려준다 */
export async function cancelPodApplication(
  podId: string,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<Pod> {
  await requirePodUser(client);
  await callPodRpc(
    client,
    'rpc_cancel_pod_application',
    { p_pod_id: podId },
    '소분팟 참여 신청 취소',
  );
  return getPod(podId, client);
}
