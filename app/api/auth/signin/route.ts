import { AuthApiError, signIn } from '@/domains/auth/auth.server';
import type { SignInRequest } from '@/domains/auth/auth.types';

/** POST /api/auth/signin — 이메일·비밀번호 로그인 */
export async function POST(request: Request): Promise<Response> {
  let body: SignInRequest;
  try {
    body = (await request.json()) as SignInRequest;
  } catch {
    return Response.json(
      { error: { message: '요청 본문 형식을 확인해 주세요.' } },
      { status: 400 },
    );
  }

  try {
    return Response.json({ data: await signIn(body) });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('로그인 실패', e);
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
