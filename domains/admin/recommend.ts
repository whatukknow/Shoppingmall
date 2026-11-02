import {
  recommend,
  RECOMMENDATION_PRODUCTS,
  saju,
} from '@/domains/home/onboarding/react/recommendation';
import { findCatalogProduct } from '@/domains/products/catalog/catalog';
import type { TasteAnswers } from '@/domains/home/onboarding/react/answers';
import type { ElementCode, TasteConfig } from './taste-config';

type Tuple = string[];
export function recommendConfigured(
  answers: TasteAnswers,
  config: TasteConfig,
) {
  const base = recommend(answers);
  const { elementWeight, sundayWeight, kitElementBonus } = config.rules;
  const code = base.z.el as ElementCode;
  const overrides = config.recommendations[code];
  if (
    elementWeight === 3 &&
    sundayWeight === 2 &&
    kitElementBonus === 3 &&
    overrides.length === 0
  )
    return base;
  const z = saju(answers.y, answers.m, answers.d);
  const sun = answers.sun ?? 'b',
    fridge = answers.fridge ?? 'empty';
  let h = 0;
  const seed =
    String(answers.y) +
    '-' +
    answers.m +
    '-' +
    answers.d +
    answers.nick +
    answers.sun +
    answers.fridge;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  function score(p: Tuple) {
    let points = p[2] === z.el ? elementWeight : 0;
    if (p[3].includes(sun)) points += sundayWeight;
    if (
      (fridge === 'sauce' && p[4] === 's') ||
      (fridge === 'wilted' && p[4] === 'v')
    )
      points -= 99;
    if (fridge === 'empty' && p[4] === 's') points -= 3;
    if (fridge === 'banchan' && p[4] === 's') points -= 2;
    h = (h * 1103515245 + 12345) | 0;
    return points + (((h >>> 8) & 0xffff) / 0xffff) * 0.9;
  }
  const rank = (kind: string) =>
    (RECOMMENDATION_PRODUCTS as Tuple[])
      .filter((p) => p[1] === kind)
      .map((p) => ({
        p,
        score: score(p) + (kind === 'K' && p[2] === z.el ? kitElementBonus : 0),
      }))
      .sort((a, b) => b.score - a.score);
  const ingredients = rank('R'),
    kits = rank('K');
  const count = fridge === 'banchan' ? 2 : 3;
  const preferred = overrides
    .map((id) => {
      const name = findCatalogProduct(id)?.name;
      return [...ingredients, ...kits].find((item) => item.p[0] === name);
    })
    .filter((item) => item !== undefined);
  // Fridge exclusion rules still apply to editorial product preferences.
  const eligible = ingredients.filter((item) => item.score > -50);
  const ordered = [
    ...preferred.filter((item) => item.p[1] === 'R' && item.score > -50),
    ...eligible.filter((item) => item.p[2] === z.el).slice(0, 2),
    ...eligible,
  ];
  const items = ordered
    .filter(
      (item, index) =>
        ordered.findIndex((other) => other.p[0] === item.p[0]) === index,
    )
    .slice(0, count)
    .map((item) => item.p);
  const kit = preferred.find((item) => item.p[1] === 'K')?.p ?? kits[0].p;
  return { ...base, items, kit };
}
