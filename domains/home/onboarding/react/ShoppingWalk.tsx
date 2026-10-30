'use client';

import { foodLabel } from '@/shared/lib/food-label';
import { PixelIcon } from './PixelIcon';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { HeroSprite } from './HeroSprite';
import { Hud } from './Hud';
import { useTaste } from './TasteProvider';
import { useBoing } from './useBoing';

export type ShoppingWalkHandle = {
  run: (done: (quote: { n: number; why: string }) => void) => void;
};
type Item = { name: string; kit: boolean };

export const ShoppingWalk = forwardRef<ShoppingWalkHandle, { items: Item[] }>(
  function ShoppingWalk({ items }, ref) {
    const { answers, quote, collect } = useTaste();
    const sound = useBoing();
    const [running, setRunning] = useState(false);
    const [collected, setCollected] = useState<number[]>([]);
    const [reward, setReward] = useState<{
      index: number;
      credit: boolean;
      why: string;
      left: number;
      top: number;
    } | null>(null);
    const walk = useRef<HTMLDivElement>(null);
    const hero = useRef<HTMLDivElement>(null);
    const icons = useRef<(HTMLSpanElement | null)[]>([]);
    const frame = useRef(0);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
    const active = useRef(false);
    const animations = useRef<Animation[]>([]);
    useEffect(
      () => () => {
        cancelAnimationFrame(frame.current);
        clearTimeout(timeout.current);
        active.current = false;
        animations.current.forEach((animation) => animation.cancel());
      },
      [],
    );

    useImperativeHandle(ref, () => ({
      run(done) {
        if (active.current || !walk.current || !hero.current) return;
        active.current = true;
        sound.unlock();
        setRunning(true);
        setCollected([]);
        const reduced = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        const offer = quote(items.length);
        const width = walk.current.clientWidth;
        let started = 0,
          got = 0;
        walk.current.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'center',
        });
        const grab = (index: number) => {
          sound.boing(index);
          const credit = index < offer.n;
          collect(items[index].name, credit);
          setReward({
            index,
            credit,
            why: offer.why,
            left: (hero.current?.offsetLeft ?? 4) + 18,
            top: (hero.current?.offsetTop ?? 26) - 6,
          });
          const icon = icons.current[index];
          if (!reduced && icon && hero.current) {
            const a = icon.getBoundingClientRect(),
              b = hero.current.getBoundingClientRect();
            const dx = b.left + 47 - a.left,
              dy = b.top + 40 - a.top;
            const animation = icon.animate(
              [
                { transform: 'translate(0,0) scale(1)' },
                {
                  transform: `translate(${dx * 0.5}px,${dy - 34}px) scale(.85)`,
                  offset: 0.5,
                },
                { transform: `translate(${dx}px,${dy}px) scale(.42)` },
              ],
              { duration: 360, easing: 'cubic-bezier(.3,.6,.4,1)' },
            );
            animations.current.push(animation);
            animation.finished
              .then(() => setCollected((current) => [...current, index]))
              .catch(() => {});
          } else setCollected((current) => [...current, index]);
        };
        const finish = () => {
          setRunning(false);
          active.current = false;
          hero.current?.classList.remove('alt');
          if (!reduced)
            hero.current?.animate(
              [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-14px)' },
                { transform: 'translateY(0)' },
              ],
              { duration: 420, easing: 'ease-out' },
            );
          timeout.current = setTimeout(
            () => {
              setReward(null);
              done(offer);
            },
            reduced ? 0 : 450,
          );
        };
        if (reduced) {
          items.forEach((_, index) => grab(index));
          if (hero.current) hero.current.style.left = `${width - 110}px`;
          finish();
          return;
        }
        const tick = (time: number) => {
          if (!started) started = time;
          const progress = Math.min(1, (time - started) / 4500);
          const x = 4 + (width - 116) * progress;
          if (hero.current) {
            hero.current.style.left = `${x}px`;
            hero.current.style.bottom = `${20 + Math.abs(Math.sin(progress * Math.PI * 10)) * 3}%`;
            hero.current.classList.toggle(
              'alt',
              Math.floor((time - started) / 130) % 2 === 1,
            );
          }
          while (
            got < items.length &&
            x + 46 >= ([0.34, 0.52, 0.7, 0.86][got] ?? 0.86) * width - 4
          )
            grab(got++);
          if (progress < 1) frame.current = requestAnimationFrame(tick);
          else {
            while (got < items.length) grab(got++);
            finish();
          }
        };
        frame.current = requestAnimationFrame(tick);
      },
    }));

    return (
      <div
        className="walk"
        ref={walk}
        aria-label="A character collects your recommended ingredients and meal kit"
      >
        <button
          type="button"
          className="snd"
          aria-label="Toggle sound effects"
          aria-pressed={sound.enabled}
          onClick={sound.toggle}
        >
          <svg
            viewBox="0 0 14 12"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            {[
              [1, 4, 3, 4],
              [4, 3, 1, 6],
              [5, 2, 1, 8],
              [6, 1, 1, 10],
            ].map(([x, y, width, height], index) => (
              <rect
                key={index}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={sound.enabled ? '#650f20' : '#9A8B7E'}
              />
            ))}
            {(sound.enabled
              ? [
                  [8, 4, 1, 4],
                  [10, 3, 1, 1],
                  [11, 4, 1, 4],
                  [10, 8, 1, 1],
                ]
              : [
                  [8, 4, 1, 1],
                  [9, 5, 1, 1],
                  [10, 6, 1, 1],
                  [11, 7, 1, 1],
                  [11, 4, 1, 1],
                  [10, 5, 1, 1],
                  [9, 6, 1, 1],
                  [8, 7, 1, 1],
                ]
            ).map(([x, y, width, height], index) => (
              <rect
                key={index}
                x={x}
                y={y}
                width={width}
                height={height}
                fill="#8E1B2C"
              />
            ))}
          </svg>
        </button>
        {!running && collected.length === 0 && (
          <span className="hint">
            Picking up {items.length - 1} ingredients + 1 meal kit
          </span>
        )}
        <Hud walking />
        {items.map((item, index) => (
          <div
            key={item.name}
            className={item.kit ? 'gi k' : 'gi'}
            style={{
              left: `${([0.34, 0.52, 0.7, 0.86][index] ?? 0.86) * 100}%`,
              visibility: collected.includes(index) ? 'hidden' : undefined,
            }}
          >
            <span
              ref={(element) => {
                icons.current[index] = element;
              }}
            >
              <PixelIcon name={item.name} />
            </span>
            <small>{item.kit ? 'Meal kit' : foodLabel(item.name)}</small>
          </div>
        ))}
        <div
          ref={hero}
          className={!running && collected.length === 0 ? 'wk idle' : 'wk'}
        >
          <span className="f0">
            <HeroSprite gender={answers.g} frame={0} />
          </span>
          <span className="f1">
            <HeroSprite gender={answers.g} frame={1} />
          </span>
          <span className="bin">
            {collected.map((index, position) => (
              <PixelIcon
                key={index}
                name={items[index].name}
                style={{
                  left: (position % 3) * 6,
                  bottom: Math.floor(position / 3) * 5 + 2,
                }}
              />
            ))}
          </span>
        </div>
        {reward && (
          <span
            key={reward.index}
            className={reward.credit ? 'plus' : 'plus zero'}
            style={{
              left: reward.left,
              top: reward.top,
              animation: 'lp-taste-taste-reward 800ms ease-out forwards',
            }}
          >
            {reward.credit
              ? '+1 credit'
              : reward.why === 'same'
                ? '+0 · Already collected'
                : '+0 · Limit reached'}
          </span>
        )}
      </div>
    );
  },
);
