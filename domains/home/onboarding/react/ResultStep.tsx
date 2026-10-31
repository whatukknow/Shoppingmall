'use client';

import { foodLabel } from '@/shared/lib/food-label';
import { recommendConfigured } from '@/domains/admin/recommend';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TasteFrame } from './TasteFrame';
import { useTaste } from './TasteProvider';
import { hasBirthDetails, tasteRoutes } from './answers';
import { EL, SUN_W } from './recommendation';
import { PixelIcon } from './PixelIcon';
import { saveTasteProfile } from '@/domains/auth/users.api';
import { buildTasteProfile, tasteRecommendationIds } from './tasteProfile';
import { trackTasteProfileSaved } from '@/shared/lib/analytics/client';
import { ShoppingWalk, type ShoppingWalkHandle } from './ShoppingWalk';

function ResultContent({ onRestart }: { onRestart: () => void }) {
  const { answers, remaining, config } = useTaste();
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
  const completing = useRef(false);
  const trackedProfile = useRef<string | null>(null);
  const result = recommendConfigured(answers, config);
  const code = result.z.el as keyof typeof EL;
  const element = {
    ...EL[code],
    t: config.profiles[code].title,
    copy: config.profiles[code].copy,
  };
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
          ? `+${quote.n} credits · ${left.day} left today (${left.week} this week)`
          : quote.why === 'same'
            ? 'Credits already collected · Change your answers to earn again'
            : quote.why === 'day'
              ? 'Daily limit of 8 reached · Try tomorrow'
              : 'Weekly limit of 20 reached',
      );
      timer.current = setTimeout(() => setModal(true), 1000);
    });
  };
  const complete = async () => {
    if (completing.current) return;
    completing.current = true;
    try {
      if (preference) {
        setBusy(true);
        try {
          const profile = buildTasteProfile({
            answers,
            result,
            nickname,
            consent: true,
          });
          await saveTasteProfile(profile);
          // 같은 저장 결과에서 이동만 재시도하면 완료 이벤트를 반복하지 않는다.
          const profileKey = JSON.stringify(profile);
          if (trackedProfile.current !== profileKey) {
            trackedProfile.current = profileKey;
            try {
              trackTasteProfileSaved({
                recommendationCount: tasteRecommendationIds(
                  profile.items,
                  profile.kit,
                ).length,
              });
            } catch {
              // 분석 실패가 저장 완료 이후 이동을 막지 않게 한다.
            }
          }
        } catch {
          setBusy(false);
          setToast('Could not save your preferences. Please try again.');
          return;
        }
        setBusy(false);
      }
      // 새 서버 요청으로 저장 직후의 회원별 추천을 읽는다(이전 홈 캐시 재사용 방지).
      // 저장 전 프리패치된 홈이 아닌 새 문서에서 회원별 API를 읽기 위한 의도적 전체 이동.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/#share-products');
    } catch {
      setToast('Could not open your picks. Please try again.');
    } finally {
      completing.current = false;
    }
  };
  const pool = element.go.concat(['sparkle', 'sparkle', element.e]);
  const kitMatches = result.kit[2] === result.z.el;
  const kitCopy = kitMatches
    ? `${foodLabel(result.kit[2])} meal kit · ${result.kit[3].includes(sunday) ? SUN_W[sunday] : 'One easy meal'}`
    : `Picked for ${SUN_W[sunday]}`;

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
                Start again
              </button>
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={start}
              >
                See my picks
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
                    Show these picks on your home page?
                    <small>
                      Your picks will appear in &apos;Picked for your
                      taste&apos; on the home page.
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
                      <b>Use these preferences on my home page</b>
                      <small>
                        Show my picks in &apos;Picked for your taste&apos;.
                      </small>
                    </div>
                    <i className="ck" aria-hidden="true" />
                  </button>
                </div>
                <label className="nickin">
                  <span>
                    Nickname{' '}
                    <small style={{ fontWeight: 500, color: 'var(--muted)' }}>
                      Used on your results screen
                    </small>
                  </span>
                  <input
                    className="in"
                    maxLength={10}
                    placeholder="e.g. Sleepyhead"
                    autoComplete="off"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                </label>
                <p className="what">
                  <b>When selected:</b> recommended product names
                  <br />
                  <b>Purpose:</b> personalize &apos;Picked for your taste&apos;
                  · <b>Storage:</b> this browser session
                  <br />
                </p>
                <button
                  ref={modalButton}
                  className="yes"
                  type="button"
                  disabled={busy}
                  onClick={complete}
                >
                  See my picks
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
          <p>Finding your food fortune</p>
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
                  {foodLabel(result.z.animal)} · {foodLabel(result.z.el)} energy
                </span>
                <h2>
                  {answers.nick ? `${answers.nick}’s` : 'Your'} week:{' '}
                  {element.t}
                </h2>
                <p>{element.copy}</p>
                <div className="goes">
                  {element.go.map((name, index) => (
                    <PixelIcon
                      key={name}
                      title={foodLabel(name)}
                      style={{ animationDelay: `${700 + index * 80}ms` }}
                      name={name}
                    />
                  ))}
                </div>
                <span className="goes-l">
                  Ingredients for {foodLabel(result.z.el)} energy
                </span>
              </div>
              <div className="sec walk-sec">
                <h3>
                  Your shopping trip{' '}
                  <small>Select “See my picks” to begin</small>
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
                  This week’s lucky ingredients <small>Single portions</small>
                </h3>
                <div className="items">
                  {result.items.map((product: string[], index: number) => (
                    <div
                      className="it"
                      key={product[0]}
                      style={{ animationDelay: `${1150 + index * 110}ms` }}
                    >
                      <PixelIcon name={product[0]} />
                      <b>{foodLabel(product[0])}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sec">
                <h3>
                  This week’s meal kit <small>Add it all at once</small>
                </h3>
                <div>
                  <div className="kit" style={{ animationDelay: '1500ms' }}>
                    <PixelIcon name={result.kit[0]} />
                    <div>
                      <b>{foodLabel(result.kit[0])}</b>
                      <small>{kitCopy}</small>
                    </div>
                  </div>
                </div>
              </div>
              {result.split && (
                <div className="sec">
                  <h3>
                    Share a pack <small>Payment opens at 4 members</small>
                  </h3>
                  <div className="split">
                    <PixelIcon name={result.items[0][0]} />
                    <span>{foodLabel(result.items[0][0])} shared pack</span>
                    <span className="m">
                      <i />
                    </span>
                    <span>3/4 members</span>
                  </div>
                </div>
              )}
              <div className="sec">
                <p className="why">
                  <b>{foodLabel(result.z.el)} energy</b>
                  with ingredients picked for <b>{SUN_W[sunday]}</b>.{' '}
                  {answers.fridge === 'sauce' ? (
                    <>
                      You have sauces, so we picked{' '}
                      <b>main ingredients instead</b>.
                    </>
                  ) : answers.fridge === 'banchan' ? (
                    <>
                      You have side dishes, so <b>just add a main</b>.
                    </>
                  ) : answers.fridge === 'wilted' ? (
                    <>
                      Use your vegetables first; <b>no extra produce</b> in
                      these picks.
                    </>
                  ) : (
                    <>
                      Your fridge is empty, so we started with{' '}
                      <b>the essentials</b>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="foot">
            Food fortunes are just for fun
            <br />
            Your picks also reflect your Sunday plans and what’s in your fridge
          </p>
        </section>
      )}
    </TasteFrame>
  );
}

export function ResultStep() {
  const router = useRouter();
  const leaving = useRef(false);
  const { answers, setAnswers } = useTaste();
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
        <p>Finding your food fortune</p>
      </section>
    </TasteFrame>
  );
}
