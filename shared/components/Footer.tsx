'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

/** 프로젝트에서 제공하는 브랜드 정보와 정책 페이지 경로입니다. */
export type BrandInformationProps = {
  brandName?: string;
  representative?: string;
  address?: string;
  customerService?: string;
  termsUrl?: string;
  privacyUrl?: string;
};

/** 선택적 푸터 설정으로, 확인되지 않은 브랜드 정보와 분리해 관리합니다. */
export type FooterComponentProps = BrandInformationProps;

/** 모바일 취향 찾기를 제외한 페이지에 브랜드 슬로건 중심 푸터를 표시합니다. */
export default function Footer(props: FooterComponentProps = {}) {
  const pathname = usePathname();
  const hideOnMobile =
    pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  return <MainFooter {...props} hideOnMobile={hideOnMobile} />;
}

// 메인 Footer: 브랜드 슬로건과 브랜드 정보를 표시합니다.
function MainFooter({
  hideOnMobile,
  ...brandInfo
}: BrandInformationProps & { hideOnMobile: boolean }) {
  return (
    <div
      className={hideOnMobile ? 'mt-auto hidden pb-6 md:block' : 'mt-auto pb-6'}
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    >
      <footer className="text-foreground max-w-1440px mx-auto w-full px-6 py-10">
        <div className="text-right">
          <p className="font-heading text-3xl">Just enough, always fresh</p>
          <p className="mt-2 text-sm">Just enough. Always fresh.</p>
        </div>
        <BrandInformation {...brandInfo} />
      </footer>
    </div>
  );
}

// 실제 브랜드 정보와 정책 주소가 확정되면 이 영역에서 반영합니다.
/** 브랜드 정보와 정책 URL이 준비되기 전 확인 상태를 안내합니다. */
function BrandInformation({
  brandName,
  representative,
  address,
  customerService,
  termsUrl,
  privacyUrl,
}: BrandInformationProps) {
  // 전달받은 브랜드 정보와 연락처를 표시합니다.
  const fields = [
    ['Brand', brandName ?? 'Little Portions'],
    ['Representative', representative],
    ['Address', address],
    ['Customer support', customerService],
  ] as const;

  return (
    <section
      aria-label="Brand information and policies"
      className="border-foreground/20 mt-8 border-t pt-6"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
        <div>
          <h2 className="text-primary text-2xl">
            <BrandLogo />
          </h2>
          <p className="mt-2 text-sm">
            Fresh food, shared in just the right portions
          </p>
          <p className="text-muted-foreground mt-4 text-xs">
            Brand information
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Brand information</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="font-medium">{label}</dt>
                <dd
                  className={
                    value ? 'text-foreground/70' : 'text-muted-foreground'
                  }
                >
                  {label === 'Customer support' && value?.trim() ? (
                    <a href={`mailto:${value.trim()}`}>{value.trim()}</a>
                  ) : (
                    value?.trim() || 'To be confirmed'
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <nav
            aria-label="Policies"
            className="border-foreground/15 mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm"
          >
            {termsUrl ? (
              <Link href={termsUrl} className="underline underline-offset-4">
                Terms of service
              </Link>
            ) : (
              <span>
                Terms of service{' '}
                <span className="text-muted-foreground">
                  (Link coming soon)
                </span>
              </span>
            )}
            {privacyUrl ? (
              <Link href={privacyUrl} className="underline underline-offset-4">
                Privacy policy
              </Link>
            ) : (
              <span>
                Privacy policy{' '}
                <span className="text-muted-foreground">
                  (Link coming soon)
                </span>
              </span>
            )}
          </nav>
        </div>
      </div>
    </section>
  );
}
