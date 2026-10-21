'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaste } from './TasteProvider';
import { hasBirthDetails, tasteRoutes } from './answers';
import { saju, EL } from './recommendation';
import { PixelIcon } from './PixelIcon';
import { TasteFrame } from './TasteFrame';

export function BirthDetailsStep() {
  const { answers, setAnswers } = useTaste();
  const router = useRouter();
  const nickRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const dayRef = useRef<HTMLSelectElement>(null);
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(timer);
  }, [toast]);
  const [submitted, setSubmitted] = useState(false);
  const validNick = answers.nick.trim().length > 0;
  const validDate = Boolean(answers.y && answers.m && answers.d);
  const zodiac = validDate ? saju(answers.y, answers.m, answers.d) : undefined;
  const days =
    answers.y && answers.m ? new Date(answers.y, answers.m, 0).getDate() : 31;
  const changeDate = (key: 'y' | 'm' | 'd', value: string) => {
    setAnswers((current) => {
      const updated = { ...current, [key]: value ? Number(value) : null };
      if (updated.y && updated.m && updated.d)
        updated.d = Math.min(
          updated.d,
          new Date(updated.y, updated.m, 0).getDate(),
        );
      return updated;
    });
  };
  const next = () => {
    setSubmitted(true);
    if (!hasBirthDetails(answers)) {
      setToast(true);
      const field = (
        !validNick
          ? nickRef
          : !answers.y
            ? yearRef
            : !answers.m
              ? monthRef
              : dayRef
      ).current;
      field?.focus();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        field
          ?.closest('.fld')
          ?.animate(
            [
              { transform: 'translateX(0)' },
              { transform: 'translateX(-6px)', offset: 0.2 },
              { transform: 'translateX(6px)', offset: 0.4 },
              { transform: 'translateX(-6px)', offset: 0.6 },
              { transform: 'translateX(6px)', offset: 0.8 },
              { transform: 'translateX(0)' },
            ],
            { duration: 400 },
          );
      }
      return;
    }
    setAnswers((current) => ({ ...current, nick: current.nick.trim() }));
    router.push(tasteRoutes[1]);
  };

  return (
    <TasteFrame
      step={0}
      onNext={next}
      nextSoft={!hasBirthDetails(answers)}
      overlay={
        <div className={toast ? 'toast show' : 'toast'} role="status">
          닉네임과 생년월일을 입력해 주세요
        </div>
      }
    >
      <section className="step on" id="q1">
        <div className="head">
          <PixelIcon name="crystal" />
          <span className="k">
            <i className="pf">STEP 1</i>한 끼 사주
          </span>
          <h1>이번 주, 당신의 식운을 볼게요</h1>
          <p className="sub">
            태어난 날로 오늘의 기운을 읽고
            <br />
            어울리는 식재료를 골라 드려요
          </p>
        </div>
        <div className="panel">
          <div className={submitted && !validNick ? 'fld err' : 'fld'}>
            <label className="lb" htmlFor="taste-nick">
              닉네임<small className="req">필수 · 결과 화면에 표시돼요</small>
            </label>
            <input
              ref={nickRef}
              className="in"
              id="taste-nick"
              maxLength={10}
              placeholder="예) 늦잠러"
              autoComplete="off"
              value={answers.nick}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  nick: event.target.value,
                }))
              }
              aria-describedby="taste-nick-error"
            />
            <p className="err-msg" id="taste-nick-error" role="alert">
              {submitted && !validNick
                ? '닉네임을 적어 주세요. 결과 카드에 표시돼요'
                : ''}
            </p>
          </div>
          <div className={submitted && !validDate ? 'fld err' : 'fld'}>
            <span className="lb">
              생년월일<small className="req">필수 · 띠와 오행을 계산해요</small>
            </span>
            <div className="dob">
              <select
                ref={yearRef}
                className={!answers.y ? 'in empty' : 'in'}
                aria-label="태어난 해"
                value={answers.y ?? ''}
                onChange={(event) => changeDate('y', event.target.value)}
              >
                <option value="">연도</option>
                {Array.from({ length: 61 }, (_, index) => 2010 - index).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ),
                )}
              </select>
              <select
                ref={monthRef}
                className={!answers.m ? 'in empty' : 'in'}
                aria-label="태어난 달"
                value={answers.m ?? ''}
                onChange={(event) => changeDate('m', event.target.value)}
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ),
                )}
              </select>
              <select
                ref={dayRef}
                className={!answers.d ? 'in empty' : 'in'}
                aria-label="태어난 날"
                value={answers.d ?? ''}
                onChange={(event) => changeDate('d', event.target.value)}
              >
                <option value="">일</option>
                {Array.from({ length: days }, (_, index) => index + 1).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}일
                    </option>
                  ),
                )}
              </select>
            </div>
            <p className="err-msg" role="alert">
              {submitted && !validDate
                ? `${!answers.y ? '태어난 해' : !answers.m ? '태어난 달' : '태어난 날'}을 골라 주세요`
                : ''}
            </p>
          </div>
          <div className="fld">
            <span className="lb">
              성별<small>선택</small>
            </span>
            <div className="seg">
              {(
                [
                  ['f', '여성'],
                  ['m', '남성'],
                  ['n', '선택 안 함'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={answers.g === value}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, g: value }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="peek">
            <PixelIcon name={zodiac?.ae ?? 'crystal'} />
            <p>
              {zodiac ? (
                <>
                  <b>
                    {zodiac.animal}띠 · {zodiac.el}(
                    {EL[zodiac.el as keyof typeof EL].h})의 기운
                  </b>
                  <br />
                  {zodiac.y !== answers.y
                    ? `입춘 전 출생이라 ${zodiac.y}년 기준이에요`
                    : '다음 단계에서 식운을 완성해요'}
                </>
              ) : (
                <>
                  <b>생년월일을 고르면</b>
                  <br />
                  띠와 오행이 바로 보여요
                </>
              )}
            </p>
          </div>
        </div>
        <p className="note">
          응답은 식운 결과를 계산할 때만 사용해요. 생년월일과 성별은 저장하거나
          전송하지 않아요.
        </p>
      </section>
    </TasteFrame>
  );
}
