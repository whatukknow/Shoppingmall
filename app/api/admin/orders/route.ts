import { adminGet } from '@/domains/admin/route';
import { adminOrders } from '@/domains/admin/admin.server';
export async function GET() {
  return adminGet(() => adminOrders());
}
