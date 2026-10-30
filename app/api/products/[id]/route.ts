import { getMenuProductDetail as getProductDetail } from '@/domains/products/catalog/menu.server';

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
        { error: { message: `Product not found: ${id}` } },
        { status: 404 },
      );
    }
    return Response.json({ data });
  } catch (e) {
    console.error('상품 상세 조회 실패', e);
    return Response.json(
      { error: { message: 'Could not load product details.' } },
      { status: 500 },
    );
  }
}
