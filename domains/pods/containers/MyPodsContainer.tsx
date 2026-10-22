// 'use client' 없음: 서버에서 내 신청 팟을 조회하는 경계

import { redirect } from 'next/navigation';
import { withNext } from '@/domains/auth/auth.redirect';
import { ApiError } from '@/shared/lib/client';
import { getMe, getMyPodApplications } from '@/domains/auth/users.api';
import type { MyPodApplication } from '@/domains/auth/users.types';
import type { MyPodsTab } from '../data/myPods';
import { MyPodsView } from '../components/MyPodsView';

type MyPodsContainerProps = {
  tab: MyPodsTab;
};

const TAB_VALUES: MyPodsTab[] = ['all', 'recruiting', 'payable'];

export function isMyPodsTab(value: string | undefined): MyPodsTab {
  return TAB_VALUES.includes(value as MyPodsTab) ? (value as MyPodsTab) : 'all';
}

export default async function MyPodsContainer({ tab }: MyPodsContainerProps) {
  // 로그인 안 한 상태(401)면 로그인 후 이 화면으로 돌아오게
  const user = await getMe().catch((error) => {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  });

  if (!user) redirect(withNext('/login', '/mypage/pods'));

  const response = await getMyPodApplications({ limit: 0 });

  // 취소된 신청이 목록에 섞여 와도 화면에서는 제외 (방어 필터)
  const applications = response.list.filter(
    (app: MyPodApplication) => String(app.status) !== 'cancelled',
  );

  return (
    <MyPodsView
      name={user.name}
      applications={applications}
      total={applications.length}
      tab={tab}
    />
  );
}
