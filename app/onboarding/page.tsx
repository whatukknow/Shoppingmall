import { BirthDetailsStep } from '@/domains/home/onboarding/react/BirthDetailsStep';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '한 끼 사주 | Little Portions',
};

export default function OnboardingPage() {
  return <BirthDetailsStep />;
}
