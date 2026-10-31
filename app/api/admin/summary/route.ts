import { adminGet } from '@/domains/admin/route';
import { adminSummary } from '@/domains/admin/admin.server';
export async function GET() {
  return adminGet(() => adminSummary());
}
