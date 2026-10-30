'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

const flows = {
  general: {
    label: 'Typical shopping',
    steps: [
      ['Promotions', 'Start with discounts and ads.'],
      ['Search', 'Search for the ingredients you want.'],
      ['Products', 'Browse and compare products.'],
      ['Product details', 'Check pack sizes and prices.'],
      ['Options', 'Choose your options and quantity.'],
      ['Cart', 'Add your chosen products.'],
      ['Minimums', 'Check membership requirements and delivery thresholds.'],
      ['Payment', 'Enter delivery and payment details.'],
    ],
  },
  little: {
    label: 'Little Portions',
    steps: [
      ['Discover', 'Discover meals and ingredient stories.'],
      ['Taste quiz', 'Explore your taste in three questions.'],
      ['Food picks', 'Discover matching ingredients and meal kits.'],
      ['Product details', 'Check portions and group requirements.'],
      ['Join a group', 'Join a group to share an order.'],
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
      <div
        className="flowTabs"
        role="tablist"
        aria-label="Choose a shopping journey"
      >
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
            <small>{flows[key].steps.length} steps</small>
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
