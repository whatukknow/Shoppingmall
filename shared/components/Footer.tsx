'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// TODO:
// 1. 라우팅 확정 후 Route Group별 layout.tsx로 Footer 배치 검토
// 2. usePathname 사용 범위 및 Server/Client Component 구조 검토
// 3. 상품 상세 → 최초 접근 목록 ID로 복귀하는 경로 처리
// 4. 실제 라우팅 경로에 맞춰 returnUrl 및 returnLabel 수정
// 5. Curation 페이지 제거 여부에 따라 관련 분기 정리

// 페이지별 이동 경로 및 버튼 문구
type FooterProps = {
  returnUrl?: string;
  returnLabel?: string;
};

// 페이지 경로에 따라 Footer 유형과 이동 링크 결정
export default function Footer() {
  const pathname = usePathname();

  // 상품 목록: 하위 경로(ID)가 달라도 동일한 Footer 사용
  if (pathname === '/product-list' || pathname.startsWith('/product-list/')) {
    return <SubFooter returnUrl="/" returnLabel="홈으로 돌아가기" />;
  }

  // 상품 상세: 상품 ID가 달라도 동일한 Footer 사용
  if (
    pathname === '/product-detail' ||
    pathname.startsWith('/product-detail/')
  ) {
    return (
      <SubFooter
        // TODO: 최초 접근한 상품 목록 ID를 포함한 URL로 변경
        returnUrl="/product-list"
        returnLabel="목록으로 돌아가기"
      />
    );
  }

  switch (pathname) {
    case '/':
      return <MainFooter />;

    case '/portion-market':
      return <MainFooter returnUrl="/" returnLabel="홈으로 돌아가기" />;

    case '/product-list':
    case '/products':
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

// 메인 Footer
// 사용 위치: 메인페이지, 소분마켓 페이지
// 구조: 좌측 이동 링크 / 우측 영문·국문 슬로건
function MainFooter({ returnUrl, returnLabel }: FooterProps) {
  return (
    <div className="bg-background pb-[250px]">
      <footer className="text-foreground mx-auto flex w-full max-w-[1080px] items-end justify-between px-6 py-10">
        {returnUrl && (
          <Link href={returnUrl} className="text-primary text-base">
            ← {returnLabel}
          </Link>
        )}

        <div className="ml-auto text-right">
          <p className="font-heading text-3xl">Just enough, always fresh</p>
          <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
        </div>
      </footer>
    </div>
  );
}

// 서브 Footer
// 사용 위치: 상품 목록·상세, 큐레이션 상세·상품 상세
// 구조: 상단 구분선 / 좌측 로고·국문 슬로건 / 우측 이동 링크
function SubFooter({ returnUrl, returnLabel }: FooterProps) {
  return (
    <div className="bg-background pb-[250px]">
      <footer className="text-foreground mx-auto w-full max-w-[1080px] px-6 py-10">
        <hr className="border-foreground/30 mb-6 w-full border-t" />

        <div className="flex items-end justify-between">
          <div>
            <p className="font-heading text-primary text-[32px]">
              Little portions
            </p>
            <p className="mt-2 text-sm">필요한 만큼 언제나 신선하게</p>
          </div>

          {returnUrl && (
            <Link href={returnUrl} className="text-primary text-base">
              ← {returnLabel}
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
