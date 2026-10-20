import { Suspense, type ReactNode } from 'react';
import { OriginalOnboardingFrame } from '@/domains/home/components/OriginalOnboardingFrame';

import { getHomeProducts } from '@/domains/home/home.api';
import { getOnboardingTemplate } from '@/domains/home/onboarding/onboardingTemplate';

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { shareProducts } = await getHomeProducts();
  const template = await getOnboardingTemplate();
  return (
    <>
      <Suspense fallback={null}>
        <OriginalOnboardingFrame products={shareProducts} template={template} />
      </Suspense>
      {children}
    </>
  );
}
