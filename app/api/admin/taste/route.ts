import { adminGet, adminChange } from '@/domains/admin/route';
import {
  readTasteSettings,
  changeTasteSettings,
} from '@/domains/admin/admin.server';
export async function GET() {
  return adminGet(() => readTasteSettings());
}
export async function PUT(request: Request) {
  return adminChange(request, (userId, body) =>
    changeTasteSettings(userId, body),
  );
}
