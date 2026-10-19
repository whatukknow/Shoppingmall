import { PolicyDraftPage } from '@/shared/components/PolicyDraftPage';

/** 이용약관 경로를 제공하며, 확정된 약관 원문은 별도 전달 후 반영합니다. */
export default function TermsPage() {
  return (
    <PolicyDraftPage
      title="이용약관"
      description="서비스 이용약관이 이곳에 표시됩니다."
    />
  );
}
