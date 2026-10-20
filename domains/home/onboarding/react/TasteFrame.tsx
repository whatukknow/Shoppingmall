'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTaste } from './TasteProvider';
import { tasteRoutes } from './answers';
import { Hud } from './Hud';

export function TasteFrame({
  step,
  children,
  onNext,
  nextDisabled = false,
  nextSoft = false,
  actions,
  overlay,
  loading = false,
}: {
  step: 0 | 1 | 2 | 3;
  children: ReactNode;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextSoft?: boolean;
  loading?: boolean;
  actions?: ReactNode;
  overlay?: ReactNode;
}) {
  const router = useRouter();
  const { setAnswers } = useTaste();
  return (
    <div className="taste-screen">
      <div className="taste-body">
        <div className="app">
          <div className="top">
            {step === 3 && !loading && <Hud />}
            {step > 0 && step < 3 && (
              <button
                className="skip"
                type="button"
                onClick={() => {
                  setAnswers((current) => ({
                    ...current,
                    sun: current.sun ?? 'b',
                    fridge: current.fridge ?? 'empty',
                  }));
                  router.push(tasteRoutes[3]);
                }}
              >
                건너뛰기
              </button>
            )}
          </div>
          {step < 3 && (
            <div className="dots" aria-label="진행 단계">
              {[0, 1, 2].map((index) => (
                <i
                  key={index}
                  className={index === step ? 'on' : index < step ? 'done' : ''}
                />
              ))}
            </div>
          )}
          {children}
        </div>
        {step < 3 && !loading && (
          <div className="cta">
            <div className="wrap">
              {step > 0 && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => router.push(tasteRoutes[step - 1])}
                >
                  이전
                </button>
              )}
              <button
                className={nextSoft ? 'btn soft' : 'btn'}
                type="button"
                disabled={nextDisabled}
                onClick={onNext}
              >
                {step === 2 ? '내 식운 보기' : '다음'}
              </button>
            </div>
          </div>
        )}
        {actions}
        {overlay}
      </div>
    </div>
  );
}
