import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '한 끼 사주 | Little Portions',
};

export default function OnboardingPage() {
  redirect('/');
}
