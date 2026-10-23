import { listProductPods } from '@/domains/pods/pods.server';
import { PodWriteError, createPod } from '@/domains/pods/pods.write.server';
import type { PodCreateRequest } from '@/domains/pods/pods.types';

type BadRequest = { status: 400; message: string };

const STATUS_WHITELIST = ['all', 'open', 'close'] as const;
const SORT_WHITELIST = ['deadline', 'asc', 'desc'] as const;

type StatusValue = (typeof STATUS_WHITELIST)[number];
type SortValue = (typeof SORT_WHITELIST)[number];

function parseWhitelist<T extends string>(
  raw: string | null,
  name: string,
  whitelist: readonly T[],
  fallback: T,
): T | BadRequest {
  if (raw === null) return fallback;
  if (!(whitelist as readonly string[]).includes(raw)) {
    return { status: 400, message: `잘못된 ${name} 파라미터입니다: ${raw}` };
  }
  return raw as T;
}

function parseNumber(
  raw: string | null,
  name: string,
  fallback: number,
): number | BadRequest {
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return { status: 400, message: `잘못된 ${name} 파라미터입니다: ${raw}` };
  }
  return value;
}

/** GET /api/products/:id/pods — 상품별 소분팟 목록. 상품이 없어도 빈 목록을 돌려준다 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  const params = new URL(request.url).searchParams;

  const statusResult = parseWhitelist(
    params.get('status'),
    'status',
    STATUS_WHITELIST,
    'all',
  );
  if (typeof statusResult === 'object') {
    return Response.json(
      { error: { message: statusResult.message } },
      { status: 400 },
    );
  }
  const sortResult = parseWhitelist(
    params.get('sort'),
    'sort',
    SORT_WHITELIST,
    'deadline',
  );
  if (typeof sortResult === 'object') {
    return Response.json(
      { error: { message: sortResult.message } },
      { status: 400 },
    );
  }
  const limitResult = parseNumber(params.get('limit'), 'limit', 0);
  if (typeof limitResult === 'object') {
    return Response.json(
      { error: { message: limitResult.message } },
      { status: 400 },
    );
  }
  const offsetResult = parseNumber(params.get('offset'), 'offset', 0);
  if (typeof offsetResult === 'object') {
    return Response.json(
      { error: { message: offsetResult.message } },
      { status: 400 },
    );
  }

  try {
    const data = await listProductPods(id, {
      status: statusResult as StatusValue,
      sort: sortResult as SortValue,
      limit: limitResult,
      offset: offsetResult,
    });
    return Response.json({ data });
  } catch (e) {
    console.error('상품별 소분팟 목록 조회 실패', e);
    return Response.json(
      { error: { message: '소분팟 정보를 불러오지 못했습니다.' } },
      { status: 500 },
    );
  }
}

/** POST /api/products/:id/pods — 새 소분팟 생성. targetCount 2~50, deadline YYYY-MM-DD */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  let body: PodCreateRequest;
  try {
    body = (await request.json()) as PodCreateRequest;
  } catch {
    return Response.json(
      { error: { message: '요청 본문 형식을 확인해 주세요.' } },
      { status: 400 },
    );
  }

  try {
    const data = await createPod(id, {
      targetCount: body.targetCount,
      deadline: body.deadline,
    });
    return Response.json({ data });
  } catch (e) {
    if (e instanceof PodWriteError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('소분팟 생성 실패', e);
    return Response.json(
      {
        error: {
          message: '소분팟을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
