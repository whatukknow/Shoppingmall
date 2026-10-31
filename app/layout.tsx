import './globals.css';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import { Noto_Sans_KR } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Footer from '@/shared/components/Footer';
import { MastHead } from '@/shared/components/MastHead';
import { ButterBackground } from '@/shared/components/ButterBackground';
import { AnalyticsProvider } from '@/shared/components/AnalyticsProvider';
import MastHeadWithUser from './_lib/masthead-user';

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

export const metadata: Metadata = {
  title: 'Little Portions',
  description:
    'Share larger grocery packs with a buying group and get just the portion you need.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en-US"
      className={`${notoSansKr.variable} ${bbhHegarty.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <Suspense fallback={null}>
          <Suspense
            fallback={
              <MastHead
                variant="header"
                login={{ href: '/login' }}
                account={{ href: '/mypage' }}
              />
            }
          >
            <MastHeadWithUser />
          </Suspense>
        </Suspense>
        <ButterBackground>
          <Suspense fallback={null}>{children}</Suspense>
        </ButterBackground>
        <Suspense fallback={null}>
          <Footer
            brandName="Little Portions"
            representative="Seoin Bae"
            address="48 Digital-ro 33-gil, Guro-gu, Seoul, South Korea"
            customerService="littleportionscs@gmail.com"
            termsUrl="/terms"
            privacyUrl="/privacy"
          />
        </Suspense>
      </body>
    </html>
  );
}
