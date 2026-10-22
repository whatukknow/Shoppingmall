import Link from 'next/link';

/** 홈 상단 전체 폭 영상 히어로입니다. 로고와 메뉴는 app/layout의 MastHead가 겹쳐 표시합니다. */
export function HomeHero() {
  return (
    <section className="relative flex min-h-[min(736px,100svh)] w-full items-center justify-center overflow-hidden bg-black px-6 pt-12 text-white md:px-12 xl:px-[90px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/uploads/videos/home-header-poster.jpg"
        aria-label="Little Portions 메인 소개 영상"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/uploads/videos/home-header.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      <div className="max-w-1260px relative z-10 mx-auto w-full">
        <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-white/90 md:text-[17.16px]">
          TOGETHER, IN THE RIGHT PORTION
        </p>
        <h1 className="mt-8 text-[32px] leading-[1.42] font-bold tracking-[-0.04em] sm:text-[38px]">
          필요한 만큼,
          <br />
          함께 나누는 장보기
        </h1>
        <p className="mt-5 text-[13px] leading-6 text-white/90 sm:text-[15px]">
          마음에 드는 식재료를 발견하고 소분 팟에 참여해요.
          <br className="hidden sm:block" />
          모집 조건이 채워지면 결제가 열리고, 함께 나눌 준비가 시작됩니다.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center justify-center bg-[#650f20] px-[13px] text-[13px] font-medium text-white transition-colors hover:bg-[#4d0b19]"
        >
          함께 나눌 소분마켓 둘러보기{' '}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
