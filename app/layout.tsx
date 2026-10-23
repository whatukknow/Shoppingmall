import './globals.css';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import { Noto_Sans_KR } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Footer from '@/shared/components/Footer';
import { MastHead } from '@/shared/components/MastHead';
import { ButterBackground } from '@/shared/components/ButterBackground';
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
  description: 'Issue 01  느긋하게 차리는, 나의 한 접시',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${bbhHegarty.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
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
            companyName="리틀포션즈"
            representative="teamG"
            businessRegistrationNumber="000-00-00000"
            ecommerceRegistrationNumber="제0000-서울구로-0000호"
            address="서울특별시 구로구 디지털로33길 48"
            customerService="0000-0000"
            termsUrl="/terms"
            privacyUrl="/privacy"
          />
        </Suspense>
      </body>
    </html>
  );
}
