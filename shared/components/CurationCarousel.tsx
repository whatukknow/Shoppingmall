import { useState } from 'react';
import { Button } from './ui/button';

interface Slide {
  eyebrow: string;
  title: string;
  description: string;
}

/*자동 전환은 메인페이지 개인작업하면서 구현할 예정 */
// Sangdon05: error 표시만 나오지 않도록 수정하였습니다. 이어서 구현 바랍니다.
export function CurationCarousel(slides: Slide[]) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  return (
    <section
      aria-label="큐레이션 배너"
      className="mx-auto flex w-[1080px] flex-col gap-2"
    >
      <div className="flex h-[376px] w-[1080px] overflow-hidden">
        <div aria-hidden="true" className="bg-card h-full w-[620px] shrink-0" />

        <div
          id="curation-slide-content"
          aria-live="polite"
          aria-atomic="true"
          className="flex w-[460px] shrink-0 flex-col items-start gap-2 overflow-hidden p-6"
        >
          <p className="font-heading text-foreground text-[12px] leading-[1.45]">
            {slide.eyebrow}
          </p>
          <h2 className="text-primary font-sans text-[38px] leading-[1.45] font-bold whitespace-pre-line">
            {slide.title}
          </h2>
          <p className="text-foreground font-sans text-[14px] leading-[1.45] whitespace-pre-line">
            {slide.description}
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="배너 선택"
        className="flex h-10 w-[1080px] items-center justify-center gap-2"
      >
        {slides.map((item, index) => (
          <button
            key={item.eyebrow}
            type="button"
            aria-label={`${index + 1}번 배너 보기`}
            aria-controls="curation-slide-content"
            aria-pressed={currentSlide === index}
            className={`flex h-8 w-11 items-center justify-center rounded-[16px] text-xs font-bold ${
              currentSlide === index
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground bg-[#FFF2B2]'
            }`}
            onClick={() => setCurrentSlide(index)}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </section>
  );
}
