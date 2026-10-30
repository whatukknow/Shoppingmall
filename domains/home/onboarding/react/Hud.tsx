'use client';

import { CartIcon } from './CartIcon';
import { useTaste } from './TasteProvider';

export function Hud({ walking = false }: { walking?: boolean }) {
  const { cart, credits, cartPulse, creditPulse } = useTaste();
  return (
    <span className={walking ? 'whud' : 'hud'}>
      <span
        key={`cart-${cartPulse}`}
        className={cartPulse ? 'hc bump' : 'hc'}
        aria-label="Cart item count"
      >
        <CartIcon />
        <b>{cart.length}</b>
      </span>
      <span
        key={`credit-${creditPulse}`}
        className={creditPulse ? 'hc cr bump' : 'hc cr'}
        aria-label="Credits"
      >
        <i className="coin" />
        <b>{credits}</b>
      </span>
    </span>
  );
}
