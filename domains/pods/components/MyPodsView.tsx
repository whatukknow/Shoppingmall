import Link from 'next/link';
import { EmptyState } from '@/shared/components';
import { MyPageNav } from '@/domains/auth/components/MyPageNav';
import type { MyPodApplication } from '../../auth/users.types';
import { filterMyPods, type MyPodsTab } from '../data/myPods';
import { MyPodCard } from './MyPodCard';

type MyPodsViewProps = {
  name: string;
  applications: MyPodApplication[];
  total: number;
  tab: MyPodsTab;
};

// 탭 목록 (전체 {total} / 모집 중 / 결제 가능)
const TABS: { key: MyPodsTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'recruiting', label: '모집 중' },
  { key: 'payable', label: '결제 가능' },
];

// 내 신청 팟 화면 본문 — 사이드 메뉴는 페이지 그리드에서 렌더
export function MyPodsView({
  name,
  applications,
  total,
  tab,
}: MyPodsViewProps) {
  const filtered = filterMyPods(applications, tab);

  return (
    <div className="flex flex-col gap-8">
      {/* 제목 — ProfileView 제목 스타일 그대로 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold md:text-[32px]">
          {name}님의 신청 팟
        </h1>
        <p className="text-base">전체 {total}개</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* 왼쪽 사이드 메뉴 (PC) */}
        <MyPageNav
          name={name}
          active="pods"
          myPodsHref="/mypage/pods"
          profileHref="/mypage"
        />

        {/* 오른쪽 탭 + 카드 목록 */}
        <div className="flex flex-col gap-6">
          <nav aria-label="신청 팟 탭" className="flex gap-6 text-sm">
            {TABS.map((item) =>
              item.key === tab ? (
                <span key={item.key} aria-current="page" className="font-bold">
                  {item.label === '전체' ? `전체 ${total}` : item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={`/mypage/pods?tab=${item.key}`}
                  className="hover:underline"
                >
                  {item.label === '전체' ? `전체 ${total}` : item.label}
                </Link>
              ),
            )}
          </nav>

          {filtered.length === 0 ? (
            <EmptyState title="신청한 팟이 없어요." />
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((application) => (
                <MyPodCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
