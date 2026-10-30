import { PolicyDraftPage } from '@/shared/components/PolicyDraftPage';

/** 이용약관 경로를 제공하며, 확정된 약관 원문은 별도 전달 후 반영합니다. */
export default function TermsPage() {
  return (
    <PolicyDraftPage
      title="Terms of service"
      description="The terms of service will appear here."
    />
  );
}
