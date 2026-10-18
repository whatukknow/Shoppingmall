import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-5 md:px-0">
      <div className="grid gap-8 md:grid-cols-[620fr_434fr] md:items-center md:gap-[26px]">
        <div className="relative aspect-[620/376] overflow-hidden bg-[#fffdf7]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/uploads/videos/home-header-poster.jpg"
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          >
            <source src="/uploads/videos/home-header.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="md:pl-0">
          <p className="font-sans text-[10px] font-bold tracking-[0.08em] text-[#48131b]">
            THE SUNDAY EDIT
          </p>
          <h2 className="mt-4 text-[28px] leading-[1.5] font-bold tracking-[-0.03em] sm:text-[34px]">
            한 접시만큼의 수고.
            <br />
            일요일만큼의 여유.
          </h2>
          <p className="mt-4 max-w-[434px] text-[13px] leading-[1.7] text-[#77766f]">
            바쁜 평일을 지나, 나를 위한 한 끼.
            <br />
            한두 사람의 브런치와 원디쉬를 골라보세요.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex min-h-10 w-full items-center justify-center bg-[#650f20] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#4d0b19] md:w-auto md:min-w-[280px]"
          >
            이번 주 한 접시 보기 <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>
      </div>
      <div aria-label="메인 비주얼 1 of 4" className="mt-4 flex justify-center gap-2" role="img">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`size-2 rounded-full ${index === 0 ? 'bg-[#650f20]' : 'bg-[#d8c9aa]'}`}
          />
        ))}
      </div>
    </section>
  );
}
