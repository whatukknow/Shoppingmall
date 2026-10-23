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
          message: '인증을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
