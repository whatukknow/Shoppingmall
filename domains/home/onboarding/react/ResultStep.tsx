'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TasteFrame } from './TasteFrame';
import { useTaste } from './TasteProvider';
import { hasBirthDetails, tasteRoutes } from './answers';
import { recommend, EL, SUN_W } from './recommendation';
import { PixelIcon } from './PixelIcon';
import { saveTasteProfile } from '@/domains/auth/users.api';
import { buildTasteProfile } from './tasteProfile';
import { HOME_RECOMMENDATIONS_KEY } from '../../data/homeRecommendations';
import { matchOnboardingProducts } from '../../data/onboardingSelection';
import { ShoppingWalk, type ShoppingWalkHandle } from './ShoppingWalk';

function ResultContent({ onRestart }: { onRestart: () => void }) {
  const router = useRouter();
  const { answers, remaining, products } = useTaste();
  const [loading, setLoading] = useState(true);
  const [loadingIcon, setLoadingIcon] = useState('crystal');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(false);
  const [preference, setPreference] = useState(false);
  const [nickname, setNickname] = useState(answers.nick);
  const [toast, setToast] = useState('');
  const walk = useRef<ShoppingWalkHandle>(null);
  const burst = useRef<HTMLDivElement>(null);
  const modalButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const result = recommend(answers);
  const element = EL[result.z.el as keyof typeof EL];
  const sunday = answers.sun ?? 'b';

  useEffect(() => {
    const icons = [
      'crystal',
      'ani:쥐',
      'ani:호랑이',
      'ani:토끼',
      'ani:용',
      'ani:말',
      'ani:돼지',
      'el:목',
      'el:화',
      'el:수',
    ];
    let index = 0;
    const interval = setInterval(
      () => setLoadingIcon(icons[index++ % icons.length]),
      120,
    );
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 1100);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (
      loading ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const animations = Array.from(burst.current?.children ?? []).map(
      (child, index) => {
        const angle = (index / 16) * Math.PI * 2 + Math.random() * 0.3;
        const distance = 110 + Math.random() * 70;
        return child.animate(
          [
            { opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' },
            {
              opacity: 1,
              transform: `translate(calc(-50% + ${Math.cos(angle) * distance * 0.6}px),calc(-50% + ${Math.sin(angle) * distance * 0.6}px)) scale(1.15)`,
              offset: 0.45,
            },
            {
              opacity: 0,
              transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px),calc(-50% + ${Math.sin(angle) * distance + 40}px)) scale(.8) rotate(${Math.random() * 80 - 40}deg)`,
            },
          ],
          {
            duration: 1100 + Math.random() * 300,
            easing: 'cubic-bezier(.2,.8,.2,1)',
            fill: 'forwards',
          },
        );
      },
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [loading]);
  useEffect(() => {
    if (modal) modalButton.current?.focus();
  }, [modal]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const start = () => {
    setBusy(true);
    walk.current?.run((quote) => {
      setBusy(false);
      const left = remaining();
      setToast(
        quote.n
          ? `크레딧 +${quote.n} · 오늘 ${left.day} 남음 (주 ${left.week})`
          : quote.why === 'same'
            ? '이미 크레딧을 받은 결과예요 · 답을 바꾸면 새로 적립'
            : quote.why === 'day'
              ? '오늘 적립 한도 8 도달 · 내일 다시'
              : '이번 주 적립 한도 20 도달',
      );
      timer.current = setTimeout(() => setModal(true), 1000);
    });
  };
  const complete = async () => {
    try {
      if (preference) {
        const names = result.items
          .concat([result.kit])
          .map((product: string[]) => product[0]);
        sessionStorage.setItem(
          HOME_RECOMMENDATIONS_KEY,
          JSON.stringify(matchOnboardingProducts(names, products)),
        );
      } else sessionStorage.removeItem(HOME_RECOMMENDATIONS_KEY);
      if (preference) {
        setBusy(true);
        try {
          await saveTasteProfile(
            buildTasteProfile({
              answers,
              result,
              nickname,
              consent: true,
            }),
          );
        } catch {
          setBusy(false);
          setToast('취향을 저장하지 못했어요. 다시 시도해 주세요.');
          return;
        }
        setBusy(false);
      }
      sessionStorage.setItem('little-portions:onboarding-complete', 'yes');
      router.push('/#share-products');
    } catch {
      setToast('추천 상품을 열지 못했어요. 다시 시도해 주세요.');
    }
  };
  const pool = element.go.concat(['sparkle', 'sparkle', element.e]);
  const kitMatches = result.kit[2] === result.z.el;
  const kitCopy = kitMatches
    ? `${result.kit[2]}(${element.h})의 키트 · ${result.kit[3].includes(sunday) ? `${SUN_W[sunday]}에 딱 맞아요` : '한 접시로 끝나요'}`
    : `${SUN_W[sunday]}에 맞춘 구성`;

  return (
    <TasteFrame
      step={loading ? 2 : 3}
      loading={loading}
      actions={
        !loading && (
          <div className="cta">
            <div className="wrap">
              <button
                className="btn ghost"
                type="button"
                disabled={busy}
                onClick={onRestart}
              >
                다시 하기
              </button>
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={start}
              >
                메인에서 추천 확인
              </button>
            </div>
          </div>
        )
      }
      overlay={
        <>
          {modal && (
            <div className="sheet-bg show">
              <div
                className="sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="shT"
              >
                <div className="sh">
                  <PixelIcon name="sparkle" />
                  <h2 id="shT">
                    식운 추천을 메인 화면에서 확인할까요?
                    <small>
                      추천 품목은 메인 첫 번째 블록 &apos;AI가 추천하는 당신의
                      장바구니&apos;에 반영돼요
                    </small>
                  </h2>
                </div>
                <div className="bens">
                  <button
                    type="button"
                    className="ben pick"
                    aria-pressed={preference}
                    onClick={() => setPreference(!preference)}
                  >
                    <PixelIcon name={result.z.ae} />
                    <div>
                      <b>이 취향을 메인 화면에 반영</b>
                      <small>
                        메인 첫 번째 블록 &apos;AI가 추천하는 당신의
                        장바구니&apos;에서 보여줘요.
                      </small>
                    </div>
                    <i className="ck" aria-hidden="true" />
                  </button>
                </div>
                <label className="nickin">
                  <span>
                    닉네임{' '}
                    <small style={{ fontWeight: 500, color: 'var(--muted)' }}>
                      결과 화면에서만 사용해요
                    </small>
                  </span>
                  <input
                    className="in"
                    maxLength={10}
                    placeholder="예) 늦잠러"
                    autoComplete="off"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                </label>
                <p className="what">
                  <b>체크 시 전달</b> 추천 품목 이름
                  <br />
                  <b>목적</b> 메인 첫 번째 블록 &apos;AI가 추천하는 당신의
                  장바구니&apos; 구성 · <b>보관</b> 브라우저 세션 동안만 유지
                  <br />
                </p>
                <button
                  ref={modalButton}
                  className="yes"
                  type="button"
                  disabled={busy}
                  onClick={complete}
                >
                  추천 상품 보기
                </button>
              </div>
            </div>
          )}
          <div className={toast ? 'toast show' : 'toast'} role="status">
            {toast}
          </div>
        </>
      }
    >
      {loading ? (
        <section className="load on" aria-live="polite">
          <PixelIcon name={loadingIcon} />
          <p>식운을 읽고 있어요</p>
        </section>
      ) : (
        <section className="step on" id="res">
          <div className="stagewrap">
            <div className="go ring" />
            <div className="burst" ref={burst}>
              {Array.from({ length: 16 }, (_, index) => (
                <PixelIcon key={index} name={pool[index % pool.length]} />
              ))}
            </div>
            <div
              className="card pop"
              style={{ '--el': element.c } as React.CSSProperties}
            >
              <div
                className="ctop"
                style={{ '--tint': element.tint } as React.CSSProperties}
              >
                <div className="zod">
                  <PixelIcon name={result.z.ae} />
                  <PixelIcon className="elb" name={element.e} />
                </div>
                <span className="chip">
                  {result.z.animal}띠 · {result.z.el}({element.h})의 기운
                </span>
                <h2>
                  {answers.nick ? `${answers.nick}님의` : '당신의'} 이번 주는{' '}
                  {element.t}
                </h2>
                <p>{element.copy}</p>
                <div className="goes">
                  {element.go.map((name, index) => (
                    <PixelIcon
                      key={name}
                      title={name}
                      style={{ animationDelay: `${700 + index * 80}ms` }}
                      name={name}
                    />
                  ))}
                </div>
                <span className="goes-l">
                  {result.z.el}({element.h})과 어울리는 식재료
                </span>
              </div>
              <div className="sec walk-sec">
                <h3>
                  오늘의 장보기{' '}
                  <small>메인에서 추천 확인을 누르면 출발해요</small>
                </h3>
                <ShoppingWalk
                  ref={walk}
                  items={result.items
                    .map((product: string[]) => ({
                      name: product[0],
                      kit: false,
                    }))
                    .concat([{ name: result.kit[0], kit: true }])}
                />
              </div>
              <div className="sec">
                <h3>
                  이번 주 행운의 원물 <small>1인분 소분</small>
                </h3>
                <div className="items">
                  {result.items.map((product: string[], index: number) => (
                    <div
                      className="it"
                      key={product[0]}
                      style={{ animationDelay: `${1150 + index * 110}ms` }}
                    >
                      <PixelIcon name={product[0]} />
                      <b>{product[0]}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sec">
                <h3>
                  이번 주 키트 <small>한 번에 담기</small>
                </h3>
                <div>
                  <div className="kit" style={{ animationDelay: '1500ms' }}>
                    <PixelIcon name={result.kit[0]} />
                    <div>
                      <b>{result.kit[0]}</b>
                      <small>{kitCopy}</small>
                    </div>
                  </div>
                </div>
              </div>
              {result.split && (
                <div className="sec">
                  <h3>
                    나눠사기 <small>4명이 모이면 결제</small>
                  </h3>
                  <div className="split">
                    <PixelIcon name="cheese" />
                    <span>파르미지아노 1kg</span>
                    <span className="m">
                      <i />
                    </span>
                    <span>3/4명</span>
                  </div>
                </div>
              )}
              <div className="sec">
                <p className="why">
                  <b>
                    {result.z.el}({element.h})의 기운
                  </b>
                  에 어울리는 재료 중 <b>{SUN_W[sunday]}</b>에 맞는 것으로
                  골랐어요.{' '}
                  {answers.fridge === 'sauce' ? (
                    <>
                      소스는 충분하니 <b>소스는 빼고 메인 재료만</b> 골랐어요.
                    </>
                  ) : answers.fridge === 'banchan' ? (
                    <>
                      반찬이 있으니 <b>메인 하나만 더</b>하면 돼요.
                    </>
                  ) : answers.fridge === 'wilted' ? (
                    <>
                      시드는 채소가 있으니 <b>새 채소는 빼고</b> 골랐어요.
                    </>
                  ) : (
                    <>
                      냉장고가 비어 있어 <b>기본 원물부터</b> 골랐어요.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="foot">
            식운은 재미로 보는 콘텐츠예요
            <br />
            추천은 일요일 아침과 냉장고 답변을 함께 반영했어요
          </p>
        </section>
      )}
    </TasteFrame>
  );
}

export function ResultStep() {
  const leaving = useRef(false);
  const { answers, setAnswers } = useTaste();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    leaving.current = false;
  }, [pathname]);
  const ready = hasBirthDetails(answers) && answers.sun && answers.fridge;
  useEffect(() => {
    if (leaving.current || pathname !== tasteRoutes[3]) return;
    if (!hasBirthDetails(answers)) router.replace(tasteRoutes[0]);
    else if (!answers.sun) router.replace(tasteRoutes[1]);
    else if (!answers.fridge) router.replace(tasteRoutes[2]);
  }, [answers, pathname, router]);
  return ready ? (
    <ResultContent
      onRestart={() => {
        leaving.current = true;
        setAnswers((current) => ({ ...current, sun: null, fridge: null }));
        router.push(tasteRoutes[0]);
      }}
    />
  ) : (
    <TasteFrame step={3} loading>
      <section className="load on" aria-live="polite">
        <PixelIcon name="crystal" />
        <p>식운을 읽고 있어요</p>
      </section>
    </TasteFrame>
  );
}
