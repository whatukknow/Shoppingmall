'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

const flows = {
  general: {
    label: '일반 장보기',
    steps: [
      ['특가 배너', '할인과 광고에서 장보기를 시작해요.'],
      ['검색', '먹을 식재료를 직접 검색해요.'],
      ['상품 목록', '여러 상품을 둘러보고 비교해요.'],
      ['상품 상세', '용량과 가격을 확인해요.'],
      ['옵션·수량', '원하는 옵션과 수량을 골라요.'],
      ['장바구니', '선택한 상품을 담아요.'],
      ['회원·최소금액', '회원 조건과 무료배송 기준을 확인해요.'],
      ['결제', '주소와 결제 정보를 입력해요.'],
    ],
  },
  little: {
    label: 'Little Portions',
    steps: [
      ['메인', '한 접시와 식재료 이야기를 만나요.'],
      ['AI 취향 설문', '세 가지 질문으로 내 취향을 찾아요.'],
      ['추천 음식', '어울리는 식재료와 한 끼 키트를 발견해요.'],
      ['상품 상세', '소분 단위와 팟 모집 조건을 확인해요.'],
      ['소분 신청', '함께 나눌 팟에 참여해요.'],
    ],
  },
};

const flowKeys = ['general', 'little'] as const;
type FlowKey = (typeof flowKeys)[number];

export function MobileShoppingFlow() {
  const [selected, setSelected] = useState<FlowKey>('little');
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = flowKeys.length - 1;
    else if (event.key === 'ArrowRight') next = (index + 1) % flowKeys.length;
    else if (event.key === 'ArrowLeft')
      next = (index + flowKeys.length - 1) % flowKeys.length;
    else return;
    event.preventDefault();
    setSelected(flowKeys[next]);
    tabs.current[next]?.focus();
  };

  return (
    <div className="mobileFlow">
      <div className="flowTabs" role="tablist" aria-label="장보기 흐름 선택">
        {flowKeys.map((key, index) => (
          <button
            key={key}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-${key}`}
            aria-selected={selected === key}
            aria-controls={`${id}-panel`}
            tabIndex={selected === key ? 0 : -1}
            onClick={() => setSelected(key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {flows[key].label}
            <small>{flows[key].steps.length}단계</small>
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${selected}`}
        tabIndex={0}
      >
        <ol className="flowList">
          {flows[selected].steps.map(([title, description], index) => (
            <li key={`${selected}-${title}`} className="flowStep">
              <span className="flowNumber" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flowCard">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
