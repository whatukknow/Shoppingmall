// 내 신청 팟 화면에서 쓰는 순수 로직 (탭 필터 · 상태 표시/버튼 결정)

import type { MyPodApplication } from '../../auth/users.types';

// 탭: 전체 / 모집 중 / 결제 가능
export type MyPodsTab = 'all' | 'recruiting' | 'payable';

// 카드에 표시할 동작 하나 (href 가 있으면 링크, cancel 면 취소 버튼, pay 면 결제 이동 버튼)
export type MyPodAction = {
  label: string;
  href?: string;
  primary?: boolean;
  cancel?: boolean;
  pay?: boolean;
};

// 탭별로 신청 목록을 걸러낸다
export function filterMyPods(
  list: MyPodApplication[],
  tab: MyPodsTab,
): MyPodApplication[] {
  if (tab === 'recruiting') {
    return list.filter(
      (app) =>
        app.podStatus === 'recruiting' && app.paymentEligibility !== 'ready',
    );
  }
  if (tab === 'payable') {
    return list.filter((app) => app.paymentEligibility === 'ready');
  }
  return list;
}

// 신청 1건의 상태 문구와 동작 버튼을 정한다 (위에서부터 먼저 맞는 조건)
export function getMyPodView(app: MyPodApplication): {
  statusLabel: string;
  actions: MyPodAction[];
} {
  const detail: MyPodAction = {
    label: 'View details',
    href: `/pods/product/${app.productId}`,
  };

  if (app.paymentEligibility === 'ready') {
    return {
      statusLabel: 'Group full · Ready to pay',
      actions: [
        {
          label: 'Pay now',
          primary: true,
          pay: true,
        },
      ],
    };
  }
  if (app.podStatus === 'recruiting') {
    return {
      statusLabel: 'Open · Waiting for members',
      actions: [detail, { label: 'Leave group', cancel: true }],
    };
  }
  if (app.paymentEligibility === 'paid') {
    return { statusLabel: 'Paid', actions: [detail] };
  }
  if (app.paymentEligibility === 'expired') {
    return { statusLabel: 'Payment deadline passed', actions: [detail] };
  }
  if (app.podStatus === 'closed') {
    return { statusLabel: 'Group closed', actions: [detail] };
  }
  return { statusLabel: 'Group cancelled', actions: [detail] };
}
