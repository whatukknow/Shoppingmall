import { findCatalogProduct } from '@/domains/products/catalog/catalog';
import type { TasteAnswers } from './answers';

// recommend() 반환형은 JS 모듈이라 최소 구조 타입으로 정의한다
export type RecommendResult = {
  z: { animal: string; el: string };
  items: string[][];
  kit: string[];
};

export const TASTE_PROFILE_SOURCE = 'onboarding';
export const TASTE_PROFILE_VARIANT = 'react-v1';

type BuildTasteProfileInput = {
  answers: TasteAnswers;
  result: RecommendResult;
  nickname: string;
  consent: boolean;
};

// 온보딩 답변과 결과를 취향 프로필(camelCase)로 바꾼다
export function buildTasteProfile({
  answers,
  result,
  nickname,
  consent,
}: BuildTasteProfileInput): {
  source: string;
  variant: string;
  nickname: string;
  birthYear: string;
  birthMd: string;
  gender: string;
  animal: string;
  element: string;
  sunday: string;
  fridge: string;
  items: string;
  kit: string;
  consent: boolean;
  qualityFlags: string;
} {
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    source: TASTE_PROFILE_SOURCE,
    variant: TASTE_PROFILE_VARIANT,
    nickname,
    birthYear: String(answers.y),
    birthMd: `${pad(answers.m ?? 0)}${pad(answers.d ?? 0)}`,
    gender: answers.g,
    animal: result.z.animal,
    element: result.z.el,
    sunday: answers.sun ?? 'b',
    fridge: answers.fridge ?? 'empty',
    items: JSON.stringify(result.items),
    kit: JSON.stringify(result.kit),
    consent,
    qualityFlags: JSON.stringify([]),
  };
}

/** 화면의 추천 결과를 기존 카탈로그의 안정적인 ID로 제한한다. */
export function tasteRecommendationIds(
  itemsJson: string,
  kitJson: string,
): string[] {
  const items: unknown = JSON.parse(itemsJson);
  const kit: unknown = JSON.parse(kitJson);
  if (!Array.isArray(items) || !Array.isArray(kit))
    throw new Error('Invalid recommendation list');
  const picks: unknown[] = [...items, ...(kit.length ? [kit] : [])];
  const ids = picks.map((pick) => {
    if (!Array.isArray(pick) || typeof pick[0] !== 'string')
      throw new Error('Invalid recommendation item');
    const item = findCatalogProduct(pick[0]);
    if (!item) throw new Error('Unknown catalog recommendation');
    return item.id;
  });
  return [...new Set(ids)];
}
