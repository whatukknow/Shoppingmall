export type SundayAnswer = 'b' | 'p' | 'n' | 'c';
export type FridgeAnswer = 'empty' | 'sauce' | 'banchan' | 'wilted';

export type TasteAnswers = {
  nick: string;
  y: number | null;
  m: number | null;
  d: number | null;
  g: 'f' | 'm' | 'n';
  sun: SundayAnswer | null;
  fridge: FridgeAnswer | null;
};

export const initialAnswers: TasteAnswers = {
  nick: '',
  y: null,
  m: null,
  d: null,
  g: 'n',
  sun: null,
  fridge: null,
};

export const tasteRoutes = [
  '/onboarding',
  '/onboarding/sunday',
  '/onboarding/fridge',
  '/onboarding/result',
] as const;

export function hasBirthDetails(answers: TasteAnswers) {
  return Boolean(answers.nick.trim() && answers.y && answers.m && answers.d);
}
