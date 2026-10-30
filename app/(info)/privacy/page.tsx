import { PolicyDraftPage } from '@/shared/components/PolicyDraftPage';

/** 개인정보처리방침 경로를 제공하며, 확정된 원문은 별도 전달 후 반영합니다. */
export default function PrivacyPage() {
  return (
    <PolicyDraftPage
      title="Privacy policy"
      description="The privacy policy will appear here."
    />
  );
}
