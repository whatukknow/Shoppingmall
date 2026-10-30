import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getRedirectTo } from '@/domains/auth/auth.redirect';
import LoginContainer from '@/domains/auth/containers/LoginContainer';

export const metadata: Metadata = {
  title: 'Log in | Little Portions',
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

// 요청마다 달라지는 쿼리 값은 Suspense 안에서 읽기
async function LoginRedirect({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return <LoginContainer redirectTo={getRedirectTo(next)} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-[1080px] gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
      {/* 왼쪽 소개 (PC에서만 보임) */}
      <section className="hidden flex-col gap-6 md:flex">
        <h1 className="text-[32px] leading-[1.35] font-bold">
          Small portions,
          <br />a better table
        </h1>
        <p className="text-base leading-7">
          Choose just what you need,
          <br />
          and share an order with people who want the same food.
        </p>
        <div
          aria-hidden="true"
          className="border-foreground/20 aspect-[4/3] w-full border"
        />
      </section>

      {/* 오른쪽 로그인 카드 */}
      <section className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm md:hidden">
          Log in to Little Portions.
        </p>
        <Suspense fallback={null}>
          <LoginRedirect searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
