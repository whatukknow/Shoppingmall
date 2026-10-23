import { AuthApiError } from '@/domains/auth/auth.server';
import { listMyPayments } from '@/domains/auth/users.server';

type BadRequest = { status: 400; message: string };

const STATUS_WHITELIST = ['paid', 'pending'] as const;

type StatusValue = (typeof STATUS_WHITELIST)[number];

function parseStatus(raw: string | null): StatusValue | undefined | BadRequest {
  if (raw === null) return undefined;
  if (!(STATUS_WHITELIST as readonly string[]).includes(raw)) {
    return { status: 400, message: `잘못된 status 파라미터입니다: ${raw}` };
  }
  return raw as StatusValue;
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

/** GET /api/users/me/payments — 본인 결제 내역 (status paid|pending 생략 가능) */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;

  const statusResult = parseStatus(params.get('status'));
  if (typeof statusResult === 'object') {
    return Response.json(
      { error: { message: statusResult.message } },
      { status: 400 },
    );
  }
  const limitResult = parseNumber(params.get('limit'), 'limit', 20);
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
    const data = await listMyPayments({
      status: statusResult as StatusValue | undefined,
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
    console.error('내 결제 내역 조회 실패', e);
    return Response.json(
      {
        error: {
          message: '결제 내역을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
