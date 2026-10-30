'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChoiceGrid } from './ChoiceGrid';
import { FRI } from './recommendation';
import { useTaste } from './TasteProvider';
import { TasteFrame } from './TasteFrame';
import { hasBirthDetails, tasteRoutes, type FridgeAnswer } from './answers';

export function FridgeStep() {
  const { answers, setAnswers } = useTaste();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== tasteRoutes[2]) return;
    if (!hasBirthDetails(answers)) router.replace(tasteRoutes[0]);
    else if (!answers.sun) router.replace(tasteRoutes[1]);
  }, [answers, pathname, router]);
  const next = () => router.push(tasteRoutes[3]);
  return (
    <TasteFrame step={2} onNext={next} nextDisabled={!answers.fridge}>
      <section className="step on" id="q3">
        <div className="head">
          <span className="k">
            <i className="pf">STEP 3</i>Your fridge
          </span>
          <h1>What’s in your fridge?</h1>
        </div>
        <ChoiceGrid<FridgeAnswer>
          options={FRI}
          selected={answers.fridge}
          onSelect={(fridge) =>
            setAnswers((current) => ({ ...current, fridge }))
          }
          onAdvance={next}
        />
      </section>
    </TasteFrame>
  );
}
