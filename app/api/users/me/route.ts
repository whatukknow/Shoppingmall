import { connection } from 'next/server';

import { AuthApiError, getMe } from '@/domains/auth/auth.server';

/** GET /api/users/me — 세션 사용자 정보 (비로그인 401) */
export async function GET(): Promise<Response> {
  await connection();
  try {
    return Response.json({ data: await getMe() });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('회원 정보 조회 실패', e);
    return Response.json(
      {
        error: {
          message: '회원 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
