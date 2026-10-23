import {
  listProducts,
  listRandomProducts,
} from '@/domains/products/products.server';

type BadRequest = { status: 400; message: string };

const SORT_WHITELIST = ['latest', 'asc', 'desc'] as const;

type SortValue = (typeof SORT_WHITELIST)[number];

function parseSort(raw: string | null): SortValue | BadRequest {
  if (raw === null) return 'latest';
  if (!(SORT_WHITELIST as readonly string[]).includes(raw)) {
    return { status: 400, message: `잘못된 sort 파라미터입니다: ${raw}` };
  }
  return raw as SortValue;
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

/** GET /api/products — type=random 이면 랜덤 추천, 아니면 상품 목록 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const params = url.searchParams;
  const type = params.get('type');

  if (type === 'random') {
    const limitOrError = parseNumber(params.get('limit'), 'limit', 0);
    if (typeof limitOrError === 'object') {
      return Response.json(
        { error: { message: limitOrError.message } },
        { status: 400 },
      );
    }
    try {
      return Response.json({
        data: await listRandomProducts(limitOrError),
      });
    } catch (e) {
      console.error('랜덤 추천 상품 조회 실패', e);
      return Response.json(
        { error: { message: '상품 정보를 불러오지 못했습니다.' } },
        { status: 500 },
      );
    }
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
  const sortResult = parseSort(params.get('sort'));
  if (typeof sortResult === 'object') {
    return Response.json(
      { error: { message: sortResult.message } },
      { status: 400 },
    );
  }

  try {
    const data = await listProducts({
      category: params.get('category') ?? 'all',
      sort: sortResult,
      limit: limitResult,
      offset: offsetResult,
    });
    return Response.json({ data });
  } catch (e) {
    console.error('상품 목록 조회 실패', e);
    return Response.json(
      { error: { message: '상품 정보를 불러오지 못했습니다.' } },
      { status: 500 },
    );
  }
}
