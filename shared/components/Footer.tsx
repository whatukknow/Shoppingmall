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

  return <SubFooter {...props} returnUrl={returnUrl} returnLabel={returnLabel} />;
}

// 메인 Footer: 홈에서 브랜드 슬로건과 회사 정보를 표시합니다.
/** 홈과 소분 마켓에서 브랜드 슬로건 및 회사 정보를 표시합니다. */
function MainFooter({ returnUrl, returnLabel, ...companyInfo }: FooterProps & CompanyInformationProps) {
  return (
    <div className="mt-auto pb-6" style={{ backgroundColor: 'var(--butter, #fff8d6)' }}>
      <footer className="text-foreground mx-auto w-full max-w-[1440px] px-6 py-10">
        <div className="flex flex-row items-end justify-between gap-6">
          {returnUrl && (
            <Link href={returnUrl} className="text-primary text-base">
              ← {returnLabel}
            </Link>
          )}

          <div className="ml-auto text-right">
            <p className="font-heading text-3xl">Just enough, always fresh</p>
            <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
          </div>
        </div>
        <CompanyInformation {...companyInfo} />
      </footer>
    </div>
  );
}

// 서브 Footer: 구분선 아래 브랜드와 회사 정보, 복귀 링크를 표시합니다.
/** 목록과 상세 화면에서 브랜드, 복귀 링크, 회사 정보를 표시합니다. */
function SubFooter({ returnUrl, returnLabel, ...companyInfo }: FooterProps & CompanyInformationProps) {
  return (
    <div className="mt-auto pb-6" style={{ backgroundColor: 'var(--butter, #fff8d6)' }}>
      <footer className="text-foreground mx-auto w-full max-w-[1440px] px-6 py-10">
        <hr className="border-foreground/30 mb-6 w-full border-t" />

        <div className="flex flex-row items-end justify-between gap-6">
          <div>
            <p className="text-primary text-[32px]">
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
          <h2 className="text-primary text-2xl"><BrandLogo /></h2>
          <p className="mt-2 text-sm">필요한 만큼, 함께 나누는 신선함</p>
          <p className="text-muted-foreground mt-4 text-xs">회사 정보 및 고객 문의</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">회사 정보</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="font-medium">{label}</dt>
                <dd className={value ? 'text-foreground/70' : 'text-muted-foreground'}>
                  {value?.trim() || '정보 입력 예정'}
                </dd>
              </div>
            ))}
          </dl>
          <nav aria-label="이용 정책" className="border-foreground/15 mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">
            {termsUrl ? (
              <Link href={termsUrl} className="underline underline-offset-4">이용약관</Link>
            ) : (
              <span>이용약관 <span className="text-muted-foreground">(주소 연결 예정)</span></span>
            )}
            {privacyUrl ? (
              <Link href={privacyUrl} className="underline underline-offset-4">개인정보처리방침</Link>
            ) : (
              <span>개인정보처리방침 <span className="text-muted-foreground">(주소 연결 예정)</span></span>
            )}
          </nav>
        </div>
      </div>
    </section>
  );
}
