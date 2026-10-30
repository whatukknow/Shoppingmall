'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChoiceGrid } from './ChoiceGrid';
import { SUN } from './recommendation';
import { useTaste } from './TasteProvider';
import { TasteFrame } from './TasteFrame';
import { hasBirthDetails, tasteRoutes, type SundayAnswer } from './answers';
import { useEffect } from 'react';

export function SundayStep() {
  const { answers, setAnswers } = useTaste();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== tasteRoutes[1]) return;
    if (!hasBirthDetails(answers)) router.replace(tasteRoutes[0]);
  }, [answers, pathname, router]);
  const next = () => router.push(tasteRoutes[2]);
  return (
    <TasteFrame step={1} onNext={next} nextDisabled={!answers.sun}>
      <section className="step on" id="q2">
        <div className="head">
          <span className="k">
            <i className="pf">STEP 2</i>Sunday morning
          </span>
          <h1>
            This Sunday morning,
            <br />
            what’s your plan?
          </h1>
        </div>
        <ChoiceGrid<SundayAnswer>
          options={SUN}
          selected={answers.sun}
          onSelect={(sun) => setAnswers((current) => ({ ...current, sun }))}
          onAdvance={next}
        />
      </section>
    </TasteFrame>
  );
}
