import { adminChange } from '@/domains/admin/route';
import { updateAdminProduct } from '@/domains/admin/admin.server';
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminChange(request, (_userId, body) => updateAdminProduct(id, body));
}
