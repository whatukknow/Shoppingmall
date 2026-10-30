import type { Metadata } from 'next';
import BrandStory from '@/domains/about/components/BrandStory';

export const metadata: Metadata = {
  title: 'Our story | Little Portions',
};

export default function AboutPage() {
  return <BrandStory />;
}
