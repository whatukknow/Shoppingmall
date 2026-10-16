'use client';

import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';

const slides = [
  {
    subtitle: 'THE SUNDAY EDIT',
    title: '한 접시만큼의 수고.\n일요일만큼의 여유.',
    description:
      '바쁜 평일을 지나, 나를 위한 한 끼.\n한두 사람의 브런치와 원디쉬를 골라보세요.',
    buttonLabel: '이번 주 한 접시 보기 ↗',
  },
  {
    subtitle: 'BREAD JOURNAL',
    title: '기다린 만큼,\n좋아지는 아침.',
    description:
      '직접 만든 발효빵으로 시작하는 하루.\n반죽에서 식탁까지, 빵의 이야기를 만나보세요.',
    buttonLabel: '발효빵 이야기 보기 ↗',
  },
  {
    subtitle: 'FRESH PICKS',
    title: '한 접시의 시작,\n신선한 재료.',
    description:
      '한두 사람의 식탁에 필요한 만큼.\n초록 채소와 토마토로 오늘의 한 끼를 골라보세요.',
    buttonLabel: '신선한 재료 둘러보기 ↗',
  },
  {
    subtitle: 'FIND YOUR MORNING',
    title: '당신은 어떤 아침을\n좋아하나요?',
    description:
      '브런치부터 발효빵, 간편한 원디쉬까지.\n취향을 골라 나만의 식탁을 찾아요.',
    buttonLabel: '내 아침 취향 고르기 ↗',
  },
];

export function MainBannerCuration() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  return (
    <section
      aria-label="메인 배너 큐레이션"
      className="mx-auto flex w-[1080px] flex-col gap-2"
    >
      <div className="flex h-[376px] w-[1080px] overflow-hidden">
        <div
          id="curation-slide-content"
          aria-live="polite"
          aria-atomic="true"
          className="ml-[620px] flex w-[460px] shrink-0 flex-col items-start gap-2 overflow-hidden p-6"
        >
          <p className="font-heading text-foreground text-[12px] leading-[1.45]">
            {slide.subtitle}
          </p>

          <h2 className="text-primary font-sans text-[38px] leading-[1.45] font-bold whitespace-pre-line">
            {slide.title}
          </h2>

          <p className="text-foreground font-sans text-[14px] leading-[1.45] whitespace-pre-line">
            {slide.description}
          </p>
          <Button
            type="button"
            className="h-[44px] w-full justify-center rounded-none text-sm"
          >
            {slide.buttonLabel}
          </Button>
        </div>
      </div>
      {/* 배너 번호 버튼 묶음: 부모 폭 안에서 가운데 정렬 */}
      <div
        role="group"
        aria-label="배너 선택"
        className="flex h-10 w-full items-center justify-center gap-2"
      >
        <button
          type="button"
          aria-label="1번 배너 보기"
          aria-controls="curation-slide-content"
          aria-pressed={currentSlide === 0}
          className={`flex h-8 w-11 items-center justify-center rounded-[16px] text-xs font-bold ${
            currentSlide === 0
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground bg-[#FFF2B2]'
          }`}
          onClick={() => setCurrentSlide(0)}
        >
          01
        </button>
        <button
          type="button"
          aria-label="2번 배너 보기"
          aria-controls="curation-slide-content"
          aria-pressed={currentSlide === 1}
          onClick={() => setCurrentSlide(1)}
          className={`flex h-8 w-11 items-center justify-center rounded-[16px] text-xs font-bold ${
            currentSlide === 1
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground bg-[#FFF2B2]'
          }`}
        >
          02
        </button>
        <button
          type="button"
          aria-label="3번 배너 보기"
          aria-controls="curation-slide-content"
          aria-pressed={currentSlide === 2}
          className={`flex h-8 w-11 items-center justify-center rounded-[16px] text-xs font-bold ${
            currentSlide === 2
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground bg-[#FFF2B2]'
          }`}
          onClick={() => setCurrentSlide(2)}
        >
          03
        </button>
        <button
          type="button"
          aria-label="4번 배너 보기"
          aria-controls="curation-slide-content"
          aria-pressed={currentSlide === 3}
          className={`flex h-8 w-11 items-center justify-center rounded-[16px] text-xs font-bold ${
            currentSlide === 3
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground bg-[#FFF2B2]'
          }`}
          onClick={() => setCurrentSlide(3)}
        >
          04
        </button>
      </div>
    </section>
  );
}
