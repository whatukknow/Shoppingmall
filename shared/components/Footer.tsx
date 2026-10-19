'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

/** 푸터의 선택적 이전 페이지 링크를 정의합니다. */
type FooterProps = {
  returnUrl?: string;
  returnLabel?: string;
};

/** Company details and policy destinations supplied by the owning project. */
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

/** Optional footer configuration, kept separate from unknown company facts. */
export type FooterComponentProps = CompanyInformationProps;

/** 현재 URL에 맞는 메인 또는 서브 푸터를 선택합니다. */
export default function Footer(props: FooterComponentProps = {}) {
  const pathname = usePathname();

  // 메인 화면은 브랜드 슬로건 중심의 푸터를 사용합니다.
  if (pathname === '/') {
    return <MainFooter {...props} />;
  }

  // 상품 상세 화면은 상품 목록으로, 나머지 화면은 홈으로 돌아갑니다.
  const isProductDetail = pathname.startsWith('/products/');
  const returnUrl = isProductDetail ? '/products' : '/';
  const returnLabel = isProductDetail ? '목록으로 돌아가기' : '홈으로 돌아가기';

  return (
    <SubFooter {...props} returnUrl={returnUrl} returnLabel={returnLabel} />
  );
}

// 메인 Footer: 홈에서 브랜드 슬로건과 회사 정보를 표시합니다.
/** 홈과 소분 마켓에서 브랜드 슬로건 및 회사 정보를 표시합니다. */
function MainFooter({
  returnUrl,
  returnLabel,
  ...companyInfo
}: FooterProps & CompanyInformationProps) {
  return (
    <div
      className="mt-auto pb-6"
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    >
      <footer className="text-foreground mx-auto w-full max-w-[1440px] px-6 py-10 lg:w-[calc(100%-200px)] lg:px-0">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          {returnUrl && (
            <Link href={returnUrl} className="text-primary text-[19.2px]">
              ← {returnLabel}
            </Link>
          )}

          <div className="ml-auto text-right">
            <p className="font-heading text-[36px]">
              Just enough, always fresh
            </p>
            <p className="mt-2 text-[16.8px]">필요한 만큼 언제나 신선하게</p>
          </div>
        </div>
        <FooterDetails {...companyInfo} enlarged />
      </footer>
    </div>
  );
}

// 서브 Footer: 구분선 아래 브랜드와 회사 정보, 복귀 링크를 표시합니다.
/** 목록과 상세 화면에서 브랜드, 복귀 링크, 회사 정보를 표시합니다. */
function SubFooter({
  returnUrl,
  returnLabel,
  ...companyInfo
}: FooterProps & CompanyInformationProps) {
  return (
    <div
      className="mt-auto pb-6"
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    >
      <footer className="text-foreground mx-auto w-full max-w-[1440px] px-6 py-10 lg:w-[calc(100%-200px)] lg:px-0">
        <hr className="border-foreground/30 mb-6 w-full border-t" />

        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary text-[38.4px]">
              <BrandLogo />
            </p>
            <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
          </div>

          {returnUrl && (
            <Link href={returnUrl} className="text-primary text-base">
              ← {returnLabel}
            </Link>
          )}
        </div>
        <FooterDetails {...companyInfo} />
      </footer>
    </div>
  );
}

/** 수정: 이용 안내와 회사 정보만 표시하며, 모바일에서는 세로로 배치합니다. */
function FooterDetails({
  enlarged = false,
  ...companyInfo
}: CompanyInformationProps & { enlarged?: boolean }) {
  return (
    <div className="border-foreground/20 mt-8 grid gap-8 border-t pt-7 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,1fr)] lg:gap-10">
      <FooterSiteMap
        termsUrl={companyInfo.termsUrl}
        privacyUrl={companyInfo.privacyUrl}
      />
      <CompanyInformation {...companyInfo} enlarged={enlarged} />
    </div>
  );
}

/** 수정: 둘러보기·알아보기 메뉴를 제거하고 이용약관·개인정보처리방침만 유지합니다. */
function FooterSiteMap({
  termsUrl,
  privacyUrl,
}: Pick<CompanyInformationProps, 'termsUrl' | 'privacyUrl'>) {
  const groups = [
    {
      title: '이용 안내',
      links: [
        ...(termsUrl ? [{ label: '이용약관', href: termsUrl }] : []),
        ...(privacyUrl
          ? [{ label: '개인정보처리방침', href: privacyUrl }]
          : []),
      ],
    },
  ];

  return (
    <nav
      aria-label="사이트맵"
      className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
    >
      {groups
        .filter(({ links }) => links.length > 0)
        .map(({ title, links }) => (
          <div key={title}>
            <h2 className="text-foreground/65 mb-3 text-sm font-semibold">
              {title}
            </h2>
            <ul className="space-y-2">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center text-[16px] underline-offset-4 hover:underline focus-visible:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </nav>
  );
}

// 회사 정보는 app/layout.tsx의 Footer 속성에서 전달합니다. 대표자명은 teamG로 변경했습니다.
/** 회사 정보와 정책 URL이 준비되기 전 확인 상태를 안내합니다. */
function CompanyInformation({
  companyName,
  representative,
  businessRegistrationNumber,
  ecommerceRegistrationNumber,
  address,
  customerService,
  enlarged = false,
}: CompanyInformationProps & { enlarged?: boolean }) {
  // 회사 정보는 전달된 값만 표시하고, 누락된 항목은 확인 전 상태로 둡니다.
  const fields = [
    ['회사명', companyName],
    ['대표자', representative],
    ['사업자등록번호', businessRegistrationNumber],
    ['통신판매업 신고번호', ecommerceRegistrationNumber],
    ['주소', address],
    ['고객센터', customerService],
  ] as const;

  return (
    <section aria-label="회사 정보 및 이용 안내" className="min-w-0">
      <h2
        className={`mb-3 font-semibold ${enlarged ? 'text-[16.8px]' : 'text-sm'}`}
      >
        회사 정보 및 고객 문의
      </h2>
      <dl
        className={`grid grid-cols-1 gap-x-6 gap-y-2 ${enlarged ? 'text-[16.8px]' : 'text-sm'}`}
      >
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-wrap gap-x-3 gap-y-1">
            <dt className="font-medium">{label}</dt>
            <dd
              className={value ? 'text-foreground/70' : 'text-muted-foreground'}
            >
              {value?.trim() || '정보 입력 예정'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
