import { getProductDetail } from '@/domains/products/products.server';

/** GET /api/products/:id — 상품 상세. 없으면 404 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  try {
    const data = await getProductDetail(id);
    if (!data) {
      return Response.json(
        { error: { message: `상품을 찾을 수 없습니다: ${id}` } },
        { status: 404 },
      );
    }
    return Response.json({ data });
  } catch (e) {
    console.error('상품 상세 조회 실패', e);
    return Response.json(
      { error: { message: '상품 정보를 불러오지 못했습니다.' } },
      { status: 500 },
    );
  }
}
