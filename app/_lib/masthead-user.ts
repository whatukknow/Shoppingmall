import { AuthApiError } from '@/domains/auth/auth.server';
import type { User } from '@/domains/auth/users.types';

type GetMeFn = () => Promise<User>;

export type MastHeadUser = { name: string } | null;

/** getMe 결과를 MastHead user prop 으로 매핑 — 401 은 정상 미로그인(null), 기타 오류만 console.error 후 null */
export async function getMastHeadUser(getMeFn: GetMeFn): Promise<MastHeadUser> {
  try {
    const user = await getMeFn();
    return { name: user.name };
  } catch (error) {
    if (!(error instanceof AuthApiError && error.status === 401)) {
      console.error('MastHead 사용자 정보 조회 실패', error);
    }
    return null;
  }
}
