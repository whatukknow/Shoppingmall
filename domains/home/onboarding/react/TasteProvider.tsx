'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { initialAnswers, type TasteAnswers } from './answers';
import { CreditLedger } from './creditLedger';
import type { HomeProduct } from '../../data/homeProducts';

type TasteState = {
  products: HomeProduct[];
  answers: TasteAnswers;
  setAnswers: Dispatch<SetStateAction<TasteAnswers>>;
  cart: string[];
  credits: number;
  cartPulse: number;
  creditPulse: number;
  quote: (count: number) => { n: number; why: string };
  collect: (name: string, credit: boolean) => void;
  remaining: () => { day: number; week: number };
};

const TasteContext = createContext<TasteState | undefined>(undefined);

export function TasteProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: HomeProduct[];
}) {
  const [answers, setAnswers] = useState<TasteAnswers>(initialAnswers);
  const [cart, setCart] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);
  const [cartPulse, setCartPulse] = useState(0);
  const [creditPulse, setCreditPulse] = useState(0);
  const ledger = useRef(new CreditLedger());
  const quote = (count: number) => ledger.current.quote(answers, count);
  const collect = (name: string, credit: boolean) => {
    setCartPulse((current) => current + 1);
    if (credit) setCreditPulse((current) => current + 1);
    setCart((current) =>
      current.includes(name) ? current : [...current, name],
    );
    if (credit) {
      ledger.current.spend();
      setCredits((current) => current + 1);
    }
  };
  const remaining = () => ledger.current.remaining();
  return (
    <TasteContext.Provider
      value={{
        products,
        answers,
        setAnswers,
        cart,
        credits,
        cartPulse,
        creditPulse,
        quote,
        collect,
        remaining,
      }}
    >
      {children}
    </TasteContext.Provider>
  );
}

export function useTaste() {
  const state = useContext(TasteContext);
  if (!state) throw new Error('TasteProvider is required');
  return state;
}
