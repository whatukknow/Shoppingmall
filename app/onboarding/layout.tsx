import type { ReactNode } from 'react';
import { Press_Start_2P } from 'next/font/google';
import { getHomeProducts } from '@/domains/home/home.api';
import { TasteProvider } from '@/domains/home/onboarding/react/TasteProvider';
import '@/domains/home/onboarding/react/original-design.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-taste-pixel',
});

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { shareProducts } = await getHomeProducts();
  return (
    <div className={pixelFont.variable}>
      <TasteProvider products={shareProducts}>{children}</TasteProvider>
    </div>
  );
}
