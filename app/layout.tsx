import './globals.css';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import { Noto_Sans_KR, Geist_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Footer from '@/shared/components/Footer';
import { MastHead } from '@/shared/components/MastHead';
import { ButterBackground } from '@/shared/components/ButterBackground';
import { HomeHeroSpacer } from '@/shared/components/HomeHeroSpacer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const notoSansKr = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  display: 'swap',
});

const bbhHegarty = localFont({
  src: './_fonts/BBHHegarty-Regular.ttf',
  variable: '--font-bbh-hegarty',
  weight: '400',
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Little Portions',
  description: 'Issue 01  느긋하게 차리는, 나의 한 접시',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${geistMono.variable} ${bbhHegarty.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <MastHead variant="header" />
        </Suspense>
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="min-h-[min(736px,100svh)] w-full"
              style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
            />
          }
        >
          <HomeHeroSpacer />
        </Suspense>
        <ButterBackground>
          <Suspense fallback={null}>{children}</Suspense>
        </ButterBackground>
        <Footer
          companyName="리틀포션즈"
          representative="teamG"
          termsUrl="/terms"
          privacyUrl="/privacy"
        />
      </body>
    </html>
  );
}
