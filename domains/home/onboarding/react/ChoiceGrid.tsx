'use client';

import { useEffect, useRef, useState } from 'react';
import { PixelIcon } from './PixelIcon';

export type Choice = { t: string; d: string; m: string };

export function ChoiceGrid<T extends string>({
  options,
  selected,
  onSelect,
  onAdvance,
}: {
  options: Record<T, Choice>;
  selected: T | null;
  onSelect: (value: T) => void;
  onAdvance: () => void;
}) {
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="opts">
      {(Object.keys(options) as T[]).map((key) => {
        const option = options[key];
        return (
          <button
            key={key}
            type="button"
            className="opt"
            aria-pressed={selected === key}
            disabled={pending}
            onClick={() => {
              setPending(true);
              onSelect(key);
              timer.current = setTimeout(onAdvance, 350);
            }}
          >
            <span className="pic">
              <PixelIcon className="main" name={option.m} />
            </span>
            <b>{option.t}</b>
            <small>{option.d}</small>
          </button>
        );
      })}
    </div>
  );
}
