// 내 신청 팟 화면에서 쓰는 순수 로직 (탭 필터 · 상태 표시/버튼 결정)

import type { MyPodApplication } from '../../auth/users.types';

// 탭: 전체 / 모집 중 / 결제 가능
export type MyPodsTab = 'all' | 'recruiting' | 'payable';

// 카드에 표시할 동작 하나 (href 가 있으면 링크, cancel 면 취소 버튼)
export type MyPodAction = {
  label: string;
  href?: string;
  primary?: boolean;
  cancel?: boolean;
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
    label: '상세 보기',
    href: `/pods/product/${app.productId}`,
  };

  if (app.paymentEligibility === 'ready') {
    return {
      statusLabel: '매칭 완료 · 결제 가능',
      actions: [
        {
          label: '결제하기',
          href: `/pods/waiting?id=${app.id}`,
          primary: true,
        },
      ],
    };
  }
  if (app.podStatus === 'recruiting') {
    return {
      statusLabel: '모집 중 · 내 신청 대기',
      actions: [detail, { label: '내 신청 취소', cancel: true }],
    };
  }
  if (app.paymentEligibility === 'paid') {
    return { statusLabel: '결제 완료', actions: [detail] };
  }
  if (app.paymentEligibility === 'expired') {
    return { statusLabel: '결제 기한 만료', actions: [detail] };
  }
  if (app.podStatus === 'closed') {
    return { statusLabel: '모집 마감', actions: [detail] };
  }
  return { statusLabel: '모집 취소', actions: [detail] };
}
