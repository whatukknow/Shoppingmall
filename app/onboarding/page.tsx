import { BirthDetailsStep } from '@/domains/home/onboarding/react/BirthDetailsStep';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Food fortune | Little Portions',
};

export default function OnboardingPage() {
  return <BirthDetailsStep />;
}
