import { AuthApiError } from '@/domains/auth/auth.server';
import type { User } from '@/domains/auth/users.types';
import { connection } from 'next/server';
import { MastHead } from '@/shared/components/MastHead';
import { getMe } from '@/domains/auth/auth.server';
import { requireAdmin } from '@/domains/admin/admin.server';
import { adminNavigationHref } from '@/domains/admin/access';

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

/** 요청 시점(connection)에만 로그인 사용자를 조회하는 마스트헤드 — Cache Components 프리렌더에서 Date.now() 실행 회피 */
export default async function MastHeadWithUser() {
  await connection();
  const [user, adminHref] = await Promise.all([
    getMastHeadUser(getMe),
    adminNavigationHref(requireAdmin),
  ]);

  return (
    <MastHead
      variant="header"
      user={user}
      adminHref={adminHref}
      login={{ href: '/login' }}
      account={{ href: '/mypage' }}
    />
  );
}
