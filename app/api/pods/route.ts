import { listPods } from '@/domains/pods/pods.server';

type BadRequest = { status: 400; message: string };

const STATUS_WHITELIST = ['open', 'close'] as const;
const SORT_WHITELIST = ['best', 'asc', 'desc'] as const;

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
    return { status: 400, message: `Invalid ${name} parameter: ${raw}` };
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
    return { status: 400, message: `Invalid ${name} parameter: ${raw}` };
  }
  return value;
}

/** GET /api/pods — 소분팟 목록 (status open|close, sort best|asc|desc, limit) */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;

  const statusResult = parseWhitelist(
    params.get('status'),
    'status',
    STATUS_WHITELIST,
    'open',
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
    'best',
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

  try {
    const data = await listPods({
      status: statusResult as StatusValue,
      sort: sortResult as SortValue,
      limit: limitResult,
    });
    return Response.json({ data });
  } catch (e) {
    console.error('소분팟 목록 조회 실패', e);
    return Response.json(
      { error: { message: 'Could not load buying groups.' } },
      { status: 500 },
    );
  }
}
