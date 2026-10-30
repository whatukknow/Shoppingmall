import { AuthApiError, signOut } from '@/domains/auth/auth.server';

/** POST /api/auth/signout — 세션 만료 */
export async function POST(): Promise<Response> {
  try {
    return Response.json({ data: await signOut() });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('로그아웃 실패', e);
    return Response.json(
      {
        error: {
          message:
            'Could not complete authentication. Please try again shortly.',
        },
      },
      { status: 500 },
    );
  }
}
