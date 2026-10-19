import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginContainer from '@/domains/auth/containers/LoginContainer';

export const metadata: Metadata = {
  title: '로그인 | Little Portions',
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

// 로그인 후 돌아갈 주소 정하기
const getRedirectTo = (next?: string | string[]) => {
  const value = Array.isArray(next) ? next[0] : next;

  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return '/';
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
          작게 나누는
          <br />
          좋은 식탁
        </h1>
        <p className="text-base leading-7">
          필요한 양만 고르고,
          <br />
          같은 상품을 원하는 사람들과 함께해요.
        </p>
        <div
          aria-hidden="true"
          className="border-foreground/20 aspect-[4/3] w-full border"
        />
      </section>

      {/* 오른쪽 로그인 카드 */}
      <section className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm md:hidden">
          Little Portions에 로그인해 주세요.
        </p>
        <Suspense fallback={null}>
          <LoginRedirect searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
