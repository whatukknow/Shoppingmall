import { adminGet } from '@/domains/admin/route';
import { adminProducts } from '@/domains/admin/admin.server';
export async function GET() {
  return adminGet(() => adminProducts());
}
