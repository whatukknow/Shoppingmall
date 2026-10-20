'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/domains/auth/components/LoginForm';
import { hasErrors, validateLogin } from '@/domains/auth/auth.validate';
import { withNext } from '@/domains/auth/auth.redirect';
import type { FieldErrors, LoginValues } from '@/domains/auth/auth.types';

type LoginContainerProps = {
  redirectTo: string; // 로그인 후 이동할 주소
};

export default function LoginContainer({ redirectTo }: LoginContainerProps) {
  const router = useRouter();

  // 입력값과 오류를 기억
  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});

  // 입력칸이 바뀔 때: 값을 바꾸고, 그 칸의 오류는 지움
  const handleChange = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // 로그인 버튼을 눌렀을 때
  const handleSubmit = () => {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return; // 오류가 있으면 여기서 멈춤

    // 온보딩을 거쳐 로그인한 경우에만 메인 진입 상태를 기록
    try {
      if (window.sessionStorage.getItem('little-portions:onboarding-pending-login') === 'yes') {
        window.sessionStorage.setItem('little-portions:onboarding-complete', 'yes');
        window.sessionStorage.removeItem('little-portions:onboarding-pending-login');
      }
    } catch {
      // 브라우저 저장소를 사용할 수 없는 환경에서는 기존 로그인 이동만 진행
    }

    // TODO: 인증 API가 생기면 여기서 로그인 요청
    // 지금은 시안 범위(구조 검토용)에 맞춰 이동만 함
    router.push(redirectTo);
  };

  return (
    <LoginForm
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      signupHref={withNext('/signup', redirectTo)}
    />
  );
}
