'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

/** 프로젝트에서 제공하는 회사 정보와 정책 페이지 경로입니다. */
export type CompanyInformationProps = {
  companyName?: string;
  representative?: string;
  businessRegistrationNumber?: string;
  ecommerceRegistrationNumber?: string;
  address?: string;
  customerService?: string;
  termsUrl?: string;
  privacyUrl?: string;
};

/** 선택적 푸터 설정으로, 확인되지 않은 회사 정보와 분리해 관리합니다. */
export type FooterComponentProps = CompanyInformationProps;

/** 모바일 취향 찾기를 제외한 페이지에 브랜드 슬로건 중심 푸터를 표시합니다. */
export default function Footer(props: FooterComponentProps = {}) {
  const pathname = usePathname();
  const hideOnMobile =
    pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  return <MainFooter {...props} hideOnMobile={hideOnMobile} />;
}

// 메인 Footer: 브랜드 슬로건과 회사 정보를 표시합니다.
function MainFooter({
  hideOnMobile,
  ...companyInfo
}: CompanyInformationProps & { hideOnMobile: boolean }) {
  return (
    <div
      className={`mt-auto pb-6${hideOnMobile ? 'hidden md:block' : ''}`}
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    >
      <footer className="text-foreground max-w-1440px mx-auto w-full px-6 py-10">
        <div className="text-right">
          <p className="font-heading text-3xl">Just enough, always fresh</p>
          <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
        </div>
        <CompanyInformation {...companyInfo} />
      </footer>
    </div>
  );
}

// 실제 회사 정보와 정책 주소가 확정되면 이 영역에서 반영합니다.
/** 회사 정보와 정책 URL이 준비되기 전 확인 상태를 안내합니다. */
function CompanyInformation({
  companyName,
  representative,
  businessRegistrationNumber,
  ecommerceRegistrationNumber,
  address,
  customerService,
  termsUrl,
  privacyUrl,
}: CompanyInformationProps) {
  // 브랜드 정보는 확정된 프로젝트 표시명이며, 법적 회사 정보는 실제 값이 입력될 때까지 미확인으로 표시합니다.
  const fields = [
    ['브랜드명', 'Little Portions'],
    ['회사명', companyName],
    ['대표자', representative],
    ['사업자등록번호', businessRegistrationNumber],
    ['통신판매업 신고번호', ecommerceRegistrationNumber],
    ['주소', address],
    ['고객센터', customerService],
  ] as const;

  return (
    <section
      aria-label="회사 정보 및 이용 안내"
      className="border-foreground/20 mt-8 border-t pt-6"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
        <div>
          <h2 className="text-primary text-2xl">
            <BrandLogo />
          </h2>
          <p className="mt-2 text-sm">필요한 만큼, 함께 나누는 신선함</p>
          <p className="text-muted-foreground mt-4 text-xs">
            회사 정보 및 고객 문의
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">회사 정보</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="font-medium">{label}</dt>
                <dd
                  className={
                    value ? 'text-foreground/70' : 'text-muted-foreground'
                  }
                >
                  {value?.trim() || '정보 입력 예정'}
                </dd>
              </div>
            ))}
          </dl>
          <nav
            aria-label="이용 정책"
            className="border-foreground/15 mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm"
          >
            {termsUrl ? (
              <Link href={termsUrl} className="underline underline-offset-4">
                이용약관
              </Link>
            ) : (
              <span>
                이용약관{' '}
                <span className="text-muted-foreground">(주소 연결 예정)</span>
              </span>
            )}
            {privacyUrl ? (
              <Link href={privacyUrl} className="underline underline-offset-4">
                개인정보처리방침
              </Link>
            ) : (
              <span>
                개인정보처리방침{' '}
                <span className="text-muted-foreground">(주소 연결 예정)</span>
              </span>
            )}
          </nav>
        </div>
      </div>
    </section>
  );
}
