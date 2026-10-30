import { AuthApiError, signUp } from '@/domains/auth/auth.server';
import type { SignUpRequest } from '@/domains/auth/auth.types';

/** POST /api/auth/signup — 이메일·비밀번호 회원가입 */
export async function POST(request: Request): Promise<Response> {
  let body: SignUpRequest;
  try {
    body = (await request.json()) as SignUpRequest;
  } catch {
    return Response.json(
      { error: { message: 'Please check the request format.' } },
      { status: 400 },
    );
  }

  try {
    return Response.json({ data: await signUp(body) });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('회원가입 실패', e);
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
