import {
  EL,
  SUN,
  FRI,
  RECOMMENDATION_PRODUCTS,
} from '@/domains/home/onboarding/react/recommendation';
import {
  catalogProducts,
  findCatalogProduct,
} from '@/domains/products/catalog/catalog';
import { AdminError } from './access';

export const ELEMENTS = ['목', '화', '토', '금', '수'] as const;
export const SUNDAYS = ['b', 'p', 'n', 'c'] as const;
export const FRIDGES = ['empty', 'sauce', 'banchan', 'wilted'] as const;
export type ElementCode = (typeof ELEMENTS)[number];
export type ChoiceCopy = { title: string; description: string };
export type TasteConfig = {
  schemaVersion: 1;
  questions: {
    sunday: {
      title: string;
      choices: Record<(typeof SUNDAYS)[number], ChoiceCopy>;
    };
    fridge: {
      title: string;
      choices: Record<(typeof FRIDGES)[number], ChoiceCopy>;
    };
  };
  profiles: Record<ElementCode, { title: string; copy: string }>;
  rules: {
    elementWeight: number;
    sundayWeight: number;
    kitElementBonus: number;
  };
  recommendations: Record<ElementCode, string[]>;
};

export const configurableProducts = catalogProducts.filter((item) =>
  RECOMMENDATION_PRODUCTS.some((tuple: string[]) => tuple[0] === item.name),
);
export const defaultTasteConfig: TasteConfig = {
  schemaVersion: 1,
  questions: {
    sunday: {
      title: 'This Sunday morning, what’s your plan?',
      choices: Object.fromEntries(
        SUNDAYS.map((key) => [
          key,
          { title: SUN[key].t, description: SUN[key].d },
        ]),
      ) as TasteConfig['questions']['sunday']['choices'],
    },
    fridge: {
      title: 'What’s in your fridge?',
      choices: Object.fromEntries(
        FRIDGES.map((key) => [
          key,
          { title: FRI[key].t, description: FRI[key].d },
        ]),
      ) as TasteConfig['questions']['fridge']['choices'],
    },
  },
  profiles: Object.fromEntries(
    ELEMENTS.map((key) => [key, { title: EL[key].t, copy: EL[key].copy }]),
  ) as TasteConfig['profiles'],
  rules: { elementWeight: 3, sundayWeight: 2, kitElementBonus: 3 },
  recommendations: { 목: [], 화: [], 토: [], 금: [], 수: [] },
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new AdminError(400, 'Expected an object.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new AdminError(400, 'Check text fields and their length limits.');
  return value.trim();
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  if (
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  )
    throw new AdminError(400, 'Unexpected or missing configuration fields.');
}

/** Rebuild the configuration rather than trusting client objects or extra keys. */
export function parseTasteConfig(input: unknown): TasteConfig {
  const data = object(input);
  exactKeys(data, [
    'schemaVersion',
    'questions',
    'profiles',
    'rules',
    'recommendations',
  ]);
  if (data.schemaVersion !== 1)
    throw new AdminError(400, 'Unsupported configuration version.');
  const questions = object(data.questions);
  exactKeys(questions, ['sunday', 'fridge']);
  function question(value: unknown, keys: readonly string[]) {
    const q = object(value);
    exactKeys(q, ['title', 'choices']);
    const choices = object(q.choices);
    exactKeys(choices, keys);
    return {
      title: text(q.title, 200),
      choices: Object.fromEntries(
        keys.map((key) => {
          const choice = object(choices[key]);
          exactKeys(choice, ['title', 'description']);
          return [
            key,
            {
              title: text(choice.title, 100),
              description: text(choice.description, 200),
            },
          ];
        }),
      ),
    };
  }
  const profiles = object(data.profiles);
  exactKeys(profiles, ELEMENTS);
  const rules = object(data.rules);
  exactKeys(rules, ['elementWeight', 'sundayWeight', 'kitElementBonus']);
  const weights = Object.fromEntries(
    Object.entries(rules).map(([key, value]) => {
      if (
        !Number.isInteger(value) ||
        (value as number) < 0 ||
        (value as number) > 10
      )
        throw new AdminError(
          400,
          'Rule weights must be whole numbers from 0 to 10.',
        );
      return [key, value];
    }),
  );
  const recommendations = object(data.recommendations);
  exactKeys(recommendations, ELEMENTS);
  const parsed = {
    schemaVersion: 1,
    questions: {
      sunday: question(questions.sunday, SUNDAYS),
      fridge: question(questions.fridge, FRIDGES),
    },
    profiles: Object.fromEntries(
      ELEMENTS.map((code) => {
        const profile = object(profiles[code]);
        exactKeys(profile, ['title', 'copy']);
        return [
          code,
          { title: text(profile.title, 100), copy: text(profile.copy, 500) },
        ];
      }),
    ),
    rules: weights,
    recommendations: Object.fromEntries(
      ELEMENTS.map((code) => {
        const ids = recommendations[code];
        if (
          !Array.isArray(ids) ||
          ids.length > 4 ||
          new Set(ids).size !== ids.length ||
          ids.some(
            (id) =>
              typeof id !== 'string' ||
              !configurableProducts.some((p) => p.id === id),
          )
        )
          throw new AdminError(
            400,
            'Use up to four distinct supported catalog IDs per profile.',
          );
        const rawCount = ids.filter((id) =>
          findCatalogProduct(id)?.id.startsWith('raw-'),
        ).length;
        const kitCount = ids.length - rawCount;
        if (rawCount > 3 || kitCount > 1)
          throw new AdminError(
            400,
            'Choose at most three ingredients and one meal kit per profile.',
          );
        return [code, [...ids]];
      }),
    ),
  };
  return parsed as TasteConfig;
}

export function parseRevision(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0)
    throw new AdminError(400, 'A valid revision is required.');
  return value as number;
}
