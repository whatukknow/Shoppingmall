import { adminGet } from '@/domains/admin/route';
import { operationOrderDetail } from '@/domains/admin/operations.server';
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return adminGet(async () => operationOrderDetail((await context.params).id));
}
