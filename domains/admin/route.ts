import { connection } from 'next/server';
import { adminFailure, adminResponse, requireAdmin } from './admin.server';
import { assertSameOrigin, readAdminJson } from './access';

export async function adminGet<T>(load: () => Promise<T>) {
  // Authentication and private reads must run only for an incoming request.
  await connection();
  try {
    await requireAdmin();
    return adminResponse({ data: await load() });
  } catch (error) {
    return adminFailure(error);
  }
}
export async function adminChange<T>(
  request: Request,
  change: (userId: string, body: unknown) => Promise<T>,
) {
  try {
    const user = await requireAdmin();
    assertSameOrigin(request);
    return adminResponse({
      data: await change(user.id, await readAdminJson(request)),
    });
  } catch (error) {
    return adminFailure(error);
  }
}
