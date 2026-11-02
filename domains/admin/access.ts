import type { User } from '@supabase/supabase-js';

export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AdminError';
  }
}

/** Only a server-controlled allowlist and an Auth-verified identity grant access. */
export function isAdmin(
  user: Pick<User, 'id' | 'email' | 'email_confirmed_at'> | null,
  allowlist = process.env.ADMIN_EMAILS ?? '',
): boolean {
  if (!user?.id || !user.email || !user.email_confirmed_at) return false;
  const emails = allowlist
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(user.email.toLowerCase());
}

/** Navigation is a convenience; page/API authorization remains independent. */
export async function adminNavigationHref(
  check: () => Promise<unknown>,
): Promise<'/admin' | undefined> {
  try {
    await check();
    return '/admin';
  } catch {
    return undefined;
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  // Next may normalize request.url to its bind hostname; Host retains the browser destination.
  const host = request.headers.get('host');
  const expectedOrigin = host ? `${url.protocol}//${host}` : url.origin;
  if (!origin || origin !== expectedOrigin) {
    throw new AdminError(403, 'Cross-origin changes are not allowed.');
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new AdminError(415, 'Send an application/json request.');
  }
}

export async function readAdminJson(request: Request): Promise<unknown> {
  // Read bounded chunks even when Content-Length is absent or dishonest.
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError(400, 'A request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 64_000) {
        await reader.cancel();
        throw new AdminError(413, 'The request is too large.');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    if (error instanceof AdminError) throw error;
    throw new AdminError(400, 'Invalid JSON.');
  } finally {
    reader.releaseLock();
  }
}
