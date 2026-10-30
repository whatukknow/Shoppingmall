import type { HomeProduct } from './homeProducts';

const recommendationAliases: readonly [string, string][] = [
  ['토마토', 'tomatoes'],
  ['딸기', 'strawberry'],
  ['사과', 'apple'],
  ['단호박', 'pumpkin'],
  ['귤', 'mandarin'],
  ['참외', 'koreanMelon'],
  ['멜론', 'melon'],
  ['포도', 'grapes'],
  ['양파', 'onion'],
  ['양배추', 'cabbage'],
  ['대파', 'scallion'],
  ['완두', 'peas'],
  ['수박', 'watermelon'],
  ['소고기', 'beefSteak'],
  ['스테이크', 'beefSteak'],
  ['돼지고기', 'porkSteak'],
  ['닭', 'chickenDrumstick'],
  ['블루베리', 'blueberries'],
  ['용과', 'dragonFruitIllustration'],
  ['복숭아', 'peachIllustration'],
];

export function matchOnboardingProducts(
  names: string[],
  products: HomeProduct[],
): string[] {
  return [
    ...new Set(
      names
        .map((name) => {
          const exactMatch = products.find((product) => product.name === name);
          if (exactMatch) return exactMatch.illustration;
          const alias = recommendationAliases.find(([keyword]) =>
            name.includes(keyword),
          )?.[1];
          return products.find((product) => product.illustration === alias)
            ?.illustration;
        })
        .filter((key): key is string => key !== undefined),
    ),
  ].slice(0, 5);
}
