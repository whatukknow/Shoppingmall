import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '회사 소개 | Little Portions',
};

// 이용 단계 3개 (시안 하단 카드)
const steps = [
  {
    no: '01',
    title: '필요한 양 고르기',
    description: '소분 상품을 둘러보고 상세 정보를 확인해요.',
  },
  {
    no: '02',
    title: '팟 신청하기',
    description: '참여 가능한 팟을 고르고 매칭을 기다려요.',
  },
  {
    no: '03',
    title: '매칭 후 결제',
    description: '신청 내용을 확인하고 결제해요.',
  },
];

// 'use client' 없음: 서버에서 그리는 읽기 전용 페이지
export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-12 px-4 py-12 md:py-20">
      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold md:text-[32px]">작게 나누는 좋은 식탁</h1>
        <p className="text-muted-foreground text-sm">Little Portions · 상점 이야기</p>
      </div>

      {/* 이미지 + 소개 글 */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div
          aria-hidden="true"
          className="border-foreground/20 aspect-[4/3] w-full border"
        />
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl leading-[1.4] font-bold">
            필요한 만큼 고르고,
            <br />
            함께 신선함을 나눠요.
          </h2>
          <p className="text-base leading-7">
            채소와 과일을 소분해 필요한 양만 구매하는 쇼핑 경험을 제안합니다.
          </p>
          <p className="text-base leading-7">
            상품을 고른 뒤 팟을 신청하고, 매칭이 완료되면 결제를 진행해요.
          </p>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground hover:bg-primary/80 flex min-h-12 items-center justify-center px-6 text-sm font-medium md:w-fit"
          >
            상품 둘러보기
          </Link>
        </div>
      </section>

      {/* 이용 단계 */}
      <section aria-label="이용 방법">
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.no}
              className="border-foreground/20 flex flex-col gap-2 border p-6"
            >
              <p className="font-bold">
                {step.no}. {step.title}
              </p>
              <p className="text-sm leading-6">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}