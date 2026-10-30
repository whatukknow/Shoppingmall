import { AuthApiError } from '@/domains/auth/auth.server';
import { listRecommendedProducts } from '@/domains/auth/users.server';

type BadRequest = { status: 400; message: string };

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

/** GET /api/users/me/product-recommendations — 취향 기반 추천 상품 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const limitResult = parseNumber(params.get('limit'), 'limit', 5);
  if (typeof limitResult === 'object') {
    return Response.json(
      { error: { message: limitResult.message } },
      { status: 400 },
    );
  }

  try {
    return Response.json({
      data: await listRecommendedProducts({ limit: limitResult }),
    });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('추천 상품 조회 실패', e);
    return Response.json(
      { error: { message: 'Could not load product details.' } },
      { status: 500 },
    );
  }
}
