'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, storeSignupAttemptToken } from '@/domains/auth/auth.api';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/domains/auth/auth.types';
import { SignupForm } from '@/domains/auth/components/SignupForm';
import { hasErrors, validateSignup } from '@/domains/auth/auth.validate';
import type { FieldErrors, SignupValues } from '@/domains/auth/auth.types';
import { withNext } from '@/domains/auth/auth.redirect';

const initialValues: SignupValues = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeNotification: false,
};

type SignupContainerProps = {
  redirectTo: string; // 로그인 후 이동할 주소
};

export default function SignupContainer({ redirectTo }: SignupContainerProps) {
  const router = useRouter();
  const submitting = useRef(false);

  const [values, setValues] = useState<SignupValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<SignupValues>>({});
  const [isPending, startTransition] = useTransition(); // 비동기 대기 중 중복 제출 차단

  // 입력칸·체크박스가 바뀔 때: 값을 바꾸고, 그 칸의 오류는 지움
  const handleChange = (field: keyof SignupValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // "Create account and log in" 버튼을 눌렀을 때
  const handleSubmit = () => {
    if (submitting.current) return;
    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return; // 오류가 있으면 여기서 멈춤

    submitting.current = true;
    startTransition(async () => {
      try {
        const response = await signUp({
          name: values.name,
          email: values.email,
          password: values.password,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
          agreeTerms: values.agreeTerms,
          agreePrivacy: values.agreePrivacy,
          agreeNotification: values.agreeNotification,
        });

        // 가입 요청의 성공은 신규 생성 증거가 아니므로 로그인 완료까지 보류한다.
        storeSignupAttemptToken(response.data.signupAttemptToken);
        router.push(withNext('/login', redirectTo));
      } catch {
        // TODO: 회원가입 실패 안내 UI
      } finally {
        submitting.current = false;
      }
    });
  };

  return (
    <SignupForm
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
