'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HOME_RECOMMENDATIONS_KEY } from '../data/homeRecommendations';
import type { HomeProduct } from '../data/homeProducts';

// 공유 상품 데이터에 정의된 일러스트 키만 사용합니다.
type ShareProductIllustration = HomeProduct['illustration'];

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
  ['달걀', 'friedEgg'],
  ['계란', 'friedEgg'],
  ['돼지고기', 'porkSteak'],
  ['닭', 'chickenDrumstick'],
  ['블루베리', 'blueberries'],
  ['용과', 'dragonFruitIllustration'],
  ['복숭아', 'peachIllustration'],
];

/** 원본 온보딩 디자인과 진입 흐름을 유지합니다.
 * TODO: 실제 상품 목록을 products로 전달해 추천 연결을 활성화합니다.
 * 목업 제거 후 현재 기본값은 빈 목록이며, HTML 내부 예시 데이터는 유지합니다.
 */
export function OriginalOnboardingFrame({
  products: shareProducts = [],
}: { products?: HomeProduct[] } = {}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!event.data || typeof event.data !== 'object') return;

      const message = event.data as { type?: unknown; productNames?: unknown };
      if (message.type !== 'little-portions:onboarding-complete') return;
      if (Array.isArray(message.productNames)) {
        const names = message.productNames.filter(
          (name): name is string => typeof name === 'string',
        );
        const illustrationKeys = [
          ...new Set(
            names
              .map((name) => {
                const exactMatch = shareProducts.find(
                  (product) => product.name === name,
                );
                if (exactMatch) return exactMatch.illustration;

                const alias = recommendationAliases.find(([keyword]) =>
                  name.includes(keyword),
                )?.[1];
                return shareProducts.find(
                  (product) => product.illustration === alias,
                )?.illustration;
              })
              .filter(
                (illustration): illustration is ShareProductIllustration =>
                  illustration !== undefined,
              ),
          ),
        ].slice(0, 5);

        window.sessionStorage.setItem(
          HOME_RECOMMENDATIONS_KEY,
          JSON.stringify(illustrationKeys),
        );
      } else {
        window.sessionStorage.removeItem(HOME_RECOMMENDATIONS_KEY);
      }
      window.sessionStorage.setItem(
        'little-portions:onboarding-pending-login',
        'yes',
      );
      router.push('/login?next=%2F%23share-products');
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router, shareProducts]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="한 끼 사주 온보딩"
      className="h-100dvh fixed inset-0 z-100 flex w-screen items-stretch justify-stretch overflow-hidden bg-[#fff8d6]"
    >
      <iframe
        ref={frameRef}
        title="한 끼 사주 온보딩"
        src="/onboarding/han-kki-saju-v1.html"
        sandbox="allow-scripts"
        className="block h-full min-h-0 w-full min-w-0 border-0"
      />
    </div>
  );
}
