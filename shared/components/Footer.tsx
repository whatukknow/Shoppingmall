'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

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

export type FooterComponentProps = CompanyInformationProps;

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
  const fields = [
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
    </section>
  );
}
