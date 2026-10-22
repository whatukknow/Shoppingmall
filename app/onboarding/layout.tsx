import type { ReactNode } from 'react';
import { Press_Start_2P } from 'next/font/google';
import { getHomeProducts } from '@/domains/home/home.api';
import { getMe } from '@/domains/auth/users.api';
import { ApiError } from '@/shared/lib/client';
import { withNext } from '@/domains/auth/auth.redirect';
import { redirect } from 'next/navigation';
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
  try {
    await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(withNext('/login', '/onboarding'));
    }
    throw error;
  }
  return (
    <div className={pixelFont.variable}>
      <TasteProvider products={shareProducts}>{children}</TasteProvider>
    </div>
  );
}
