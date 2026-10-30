import { AuthApiError } from '@/domains/auth/auth.server';
import { listMyPodApplications } from '@/domains/auth/users.server';

type BadRequest = { status: 400; message: string };

const STATUS_WHITELIST = ['all', 'open', 'close'] as const;
const SORT_WHITELIST = ['latest'] as const;

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

/** GET /api/users/me/pod-applications — 본인 소분 팟 신청 내역 */
export async function GET(request: Request): Promise<Response> {
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
    'latest',
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
    const data = await listMyPodApplications({
      status: statusResult as StatusValue,
      sort: sortResult as SortValue,
      limit: limitResult,
      offset: offsetResult,
    });
    return Response.json({ data });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('내 소분 팟 신청 내역 조회 실패', e);
    return Response.json(
      {
        error: {
          message:
            'Could not load your buying groups. Please try again shortly.',
        },
      },
      { status: 500 },
    );
  }
}
