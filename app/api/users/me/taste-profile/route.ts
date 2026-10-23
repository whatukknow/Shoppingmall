import { AuthApiError } from '@/domains/auth/auth.server';
import { getTasteProfile, putTasteProfile } from '@/domains/auth/users.server';
import type { TasteProfileRequest } from '@/domains/auth/users.types';

/** GET /api/users/me/taste-profile — 본인 취향 프로필 (비로그인 401, 없으면 404) */
export async function GET(): Promise<Response> {
  try {
    return Response.json({ data: await getTasteProfile() });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('취향 프로필 조회 실패', e);
    return Response.json(
      {
        error: {
          message:
            '취향 프로필을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}

/** PUT /api/users/me/taste-profile — 취향 프로필 저장 (본문 형식 오류 400) */
export async function PUT(request: Request): Promise<Response> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { message: '잘못된 요청 본문입니다.' } },
        { status: 400 },
      );
    }
    return Response.json({
      data: await putTasteProfile(body as TasteProfileRequest),
    });
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('취향 프로필 저장 실패', e);
    return Response.json(
      {
        error: {
          message:
            '취향 프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
