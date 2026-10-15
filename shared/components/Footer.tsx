'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 페이지 경로에 따라 Footer 유형과 이동 링크 결정
export default function Footer() {
  const pathname = usePathname();

  switch (pathname) {
    case '/':
      return <MainFooter />;

    case '/portion-market':
      return <MainFooter returnUrl="/" returnLabel="홈으로 돌아가기" />;

    case '/product-list':
      return <SubFooter returnUrl="/" returnLabel="홈으로 돌아가기" />;

    case '/product-detail':
      return (
        <SubFooter returnUrl="/product-list" returnLabel="목록으로 돌아가기" />
      );

    case '/curation-details':
      return (
        <SubFooter returnUrl="/curation" returnLabel="목록으로 돌아가기" />
      );

    case '/curation/product-details':
      return (
        <SubFooter
          returnUrl="/curation-details"
          returnLabel="이야기로 돌아가기"
        />
      );

    default:
      return null;
  }
}

// 페이지별 이동 경로 및 버튼 문구
type FooterProps = {
  returnUrl?: string;
  returnLabel?: string;
};

// 메인 Footer
// 사용 위치: 메인페이지, 소분마켓 페이지
// 구조: 좌측 이동 링크 / 우측 영문·국문 슬로건
function MainFooter({ returnUrl, returnLabel }: FooterProps) {
  return (
    <footer className="bg-background text-foreground flex w-full items-end justify-between px-6 py-10">
      <div>
        {returnUrl && (
          <Link href={returnUrl} className="text-primary text-base">
            ← {returnLabel}
          </Link>
        )}
      </div>

      <div className="text-right">
        <p className="font-heading text-3xl">Just enough, always fresh</p>
        <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
      </div>
    </footer>
  );
}

// 서브 Footer
// 사용 위치: 상품 목록·상세, 큐레이션 상세·상품 상세
// 구조: 상단 구분선 / 좌측 로고·국문 슬로건 / 우측 이동 링크
function SubFooter({ returnUrl, returnLabel }: FooterProps) {
  return (
    <footer className="bg-background w-full px-6 py-10">
      <hr className="border-foreground/30 mb-6 w-full border-t" />

      <div className="flex items-end justify-between">
        <div>
          <p className="font-heading text-primary text-[32px]">
            Little portions
          </p>
          <p className="text-foreground mt-2 text-sm">
            필요한 만큼 언제나 신선하게
          </p>
        </div>

        {returnUrl && (
          <Link href={returnUrl} className="text-primary text-base">
            ← {returnLabel}
          </Link>
        )}
      </div>
    </footer>
  );
}
