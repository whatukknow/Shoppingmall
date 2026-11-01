import { adminGet, adminChange } from '@/domains/admin/route';
import {
  operationsSnapshot,
  recordOperation,
} from '@/domains/admin/operations.server';
export async function GET(request: Request) {
  return adminGet(() => operationsSnapshot(new URL(request.url).searchParams));
}
export async function POST(request: Request) {
  return adminChange(request, recordOperation);
}
