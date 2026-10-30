'use client';

import { foodLabel } from '@/shared/lib/food-label';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaste } from './TasteProvider';
import { hasBirthDetails, tasteRoutes } from './answers';
import { saju } from './recommendation';
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
          Enter your nickname and date of birth
        </div>
      }
    >
      <section className="step on" id="q1">
        <div className="head">
          <PixelIcon name="crystal" />
          <span className="k">
            <i className="pf">STEP 1</i>Food fortune
          </span>
          <h1>What’s your food fortune?</h1>
          <p className="sub">
            Discover the energy of your birth date
            <br />
            and find ingredients to match
          </p>
        </div>
        <div className="panel">
          <div className={submitted && !validNick ? 'fld err' : 'fld'}>
            <label className="lb" htmlFor="taste-nick">
              Nickname
              <small className="req">Required · Shown on your results</small>
            </label>
            <input
              ref={nickRef}
              className="in"
              id="taste-nick"
              maxLength={10}
              placeholder="e.g. Sleepyhead"
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
                ? 'Enter a nickname for your results card'
                : ''}
            </p>
          </div>
          <div className={submitted && !validDate ? 'fld err' : 'fld'}>
            <span className="lb">
              Date of birth
              <small className="req">
                Required · Used for your zodiac and element
              </small>
            </span>
            <div className="dob">
              <select
                ref={yearRef}
                className={!answers.y ? 'in empty' : 'in'}
                aria-label="Birth year"
                value={answers.y ?? ''}
                onChange={(event) => changeDate('y', event.target.value)}
              >
                <option value="">Year</option>
                {Array.from({ length: 61 }, (_, index) => 2010 - index).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ),
                )}
              </select>
              <select
                ref={monthRef}
                className={!answers.m ? 'in empty' : 'in'}
                aria-label="Birth month"
                value={answers.m ?? ''}
                onChange={(event) => changeDate('m', event.target.value)}
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ),
                )}
              </select>
              <select
                ref={dayRef}
                className={!answers.d ? 'in empty' : 'in'}
                aria-label="Birth day"
                value={answers.d ?? ''}
                onChange={(event) => changeDate('d', event.target.value)}
              >
                <option value="">Day</option>
                {Array.from({ length: days }, (_, index) => index + 1).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ),
                )}
              </select>
            </div>
            <p className="err-msg" role="alert">
              {submitted && !validDate
                ? `Please choose your ${!answers.y ? 'birth year' : !answers.m ? 'birth month' : 'birth day'}`
                : ''}
            </p>
          </div>
          <div className="fld">
            <span className="lb">
              Gender<small>Optional</small>
            </span>
            <div className="seg">
              {(
                [
                  ['f', 'Female'],
                  ['m', 'Male'],
                  ['n', 'Prefer not to say'],
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
                    {foodLabel(zodiac.animal)} · {foodLabel(zodiac.el)} energy
                  </b>
                  <br />
                  {zodiac.y !== answers.y
                    ? `Born before the start of spring; using ${zodiac.y}`
                    : 'Continue to discover your food fortune'}
                </>
              ) : (
                <>
                  <b>Choose your birth date</b>
                  <br />
                  to reveal your zodiac and element
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </TasteFrame>
  );
}
