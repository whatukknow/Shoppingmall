import Link from 'next/link';

export function BrandStorySection() {
  return (
    <section id="brand-story" className="mx-auto mt-14 w-full max-w-[1080px] px-5 md:mt-16 md:px-0">
      <div className="grid min-h-[360px] md:min-h-[437px] md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-center bg-[#48131b] px-7 py-10 text-[#f1ebd6] sm:px-12 md:px-12">
          <p className="max-w-[440px] text-xs leading-6 text-[#f1ebd6]/80">
            한 봉지의 채소, 커다란 빵 한 덩이.
            <br />
            좋아하는 재료도 혼자 먹기엔 많을 때가 있죠.
          </p>
          <h2 className="font-heading mt-8 text-[38px] leading-[1.05] font-normal tracking-[-0.02em] sm:text-[46px]">
            A LITTLE,
            <br />
            TOGETHER.
          </h2>
          <p className="mt-7 max-w-[440px] text-xs leading-6 text-[#f1ebd6]/85">
            한두 사람의 식탁에 필요한 만큼만,
            <br />
            취향이 맞는 이웃과 장보기의 양을 나눠보세요.
            <br />
            냉장고의 부담은 덜고, 식탁의 즐거움은 더해요.
          </p>
        </div>
        <div className="flex flex-col justify-center bg-[#a88f90] px-7 py-10 text-white sm:px-12 md:px-12">
          <h3 className="text-[24px] leading-[1.5] font-bold sm:text-[30px]">
            한 봉지가 많다면,
            <br />
            조금씩 같이.
          </h3>
          <Link
            href="/products"
            className="mt-5 inline-flex w-fit items-center border-b border-white/60 pb-1 text-xs text-white transition-opacity hover:opacity-75"
          >
            소분 마켓 둘러보기 <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
