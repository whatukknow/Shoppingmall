import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getRedirectTo } from '@/domains/auth/auth.redirect';
import SignupContainer from '@/domains/auth/containers/SignupContainer';

export const metadata: Metadata = {
  title: 'Sign up | Little Portions',
};

// 가입 후 할 수 있는 것 (시안 왼쪽 안내 상자)
const benefits = [
  'Track your buying groups',
  'Explore smaller portions',
  'Personalized food picks',
];

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

// 요청마다 달라지는 쿼리 값은 Suspense 안에서 읽기
async function SignupRedirect({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;

  return <SignupContainer redirectTo={getRedirectTo(next)} />;
}

// 'use client' 없음: 서버에서 그리는 페이지
export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-[1080px] gap-10 px-4 py-12 md:grid-cols-2 md:items-start md:py-20">
      {/* 왼쪽 소개 */}
      <section className="flex flex-col gap-6">
        <h1 className="text-[32px] leading-[1.35] font-bold">
          Your next meal
          <br />
          starts here
        </h1>

        {/* 모바일 문구 */}
        <p className="text-base leading-7 md:hidden">
          Share an order. Get just enough.
        </p>

        {/* PC 문구 + 안내 상자 */}
        <p className="hidden text-base leading-7 md:block">
          Pick a product.
          <br />
          Join a buying group.
          <br />
          Pay when the group is full.
        </p>

        <div className="border-foreground/20 hidden flex-col gap-3 border p-6 md:flex">
          <h2 className="text-base font-bold">With your account</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {benefits.map((benefit) => (
              <li key={benefit}>· {benefit}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 오른쪽 회원가입 카드 */}
      <section>
        <Suspense fallback={null}>
          <SignupRedirect searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
