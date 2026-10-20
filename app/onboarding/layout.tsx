import { Suspense, type ReactNode } from 'react';
import { OriginalOnboardingFrame } from '@/domains/home/components/OriginalOnboardingFrame';

import { getHomeProducts } from '@/domains/home/home.api';

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { shareProducts } = await getHomeProducts();
  return (
    <>
      <Suspense fallback={null}>
        <OriginalOnboardingFrame products={shareProducts} />
      </Suspense>
      {children}
    </>
  );
}
