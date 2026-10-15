import './globals.css';
import { BBH_Hegarty, Noto_Sans_KR, Geist_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Footer from '@/shared/components/Footer';

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

const bbhHegarty = BBH_Hegarty({
  variable: '--font-bbh-hegarty',
  weight: '400',
  subsets: ['latin'],
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
        {children}
        <Footer />
      </body>
    </html>
  );
}
