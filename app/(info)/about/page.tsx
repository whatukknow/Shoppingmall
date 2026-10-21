import type { Metadata } from 'next';
import BrandStory from '@/domains/about/components/BrandStory';

export const metadata: Metadata = {
  title: '브랜드 이야기 | Little Portions',
};

export default function AboutPage() {
  return <BrandStory />;
}
