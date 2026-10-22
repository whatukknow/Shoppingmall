import { redirect } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import { getMe, getMyPodApplications } from '@/domains/auth/users.api';
import { withNext } from '@/domains/auth/auth.redirect';
import PodWaitingPage from '@/domains/pods/waiting/components/PodWaitingPage';
import { initialSelection } from '@/domains/pods/data/podWaiting';

type PodWaitingContainerProps = {
  selectedId?: string;
};

export default async function PodWaitingContainer({
  selectedId,
}: PodWaitingContainerProps) {
  // 로그인 안 한 상태(401)면 로그인 후 대기 화면으로 돌아오게
  const user = await getMe().catch((error) => {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  });

  if (!user) redirect(withNext('/login', '/pods/waiting'));

  const { list } = await getMyPodApplications({ limit: 0 });

  // 결제 가능한 신청만 모아서 보여준다
  const pods = list.filter((app) => app.paymentEligibility === 'ready');

  return (
    <PodWaitingPage
      pods={pods}
      initialSelectedIds={initialSelection(pods, selectedId)}
    />
  );
}
