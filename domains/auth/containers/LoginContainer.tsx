'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_PREVIEW_SESSION_KEY } from '@/domains/auth/data/authPreviewSession';
import { signIn } from '@/domains/auth/auth.api';
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
  const [isPending, startTransition] = useTransition(); // 비동기 대기 중 중복 제출 차단

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

    startTransition(async () => {
      try {
        const response = await signIn({
          email: values.email,
          password: values.password,
        });

        // TODO(session): 로그인 응답(response.data)을 세션 쿠키·캐시에 저장 — Supabase 도입 시 proxy.ts(프로젝트 루트)에서 쿠키로 사용자 확인
        void response; // 세션 구현 전까지 응답 미사용

        // 시안용 로그인 상태를 기록
        try {
          window.sessionStorage.setItem(AUTH_PREVIEW_SESSION_KEY, 'yes');
        } catch {
          // 브라우저 저장소를 사용할 수 없는 환경에서는 기존 로그인 이동만 진행
        }

        router.push(redirectTo);
      } catch {
        // TODO: 로그인 실패 안내 UI
      }
    });
  };

  return (
    <LoginForm
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      isPending={isPending}
      signupHref={withNext('/signup', redirectTo)}
    />
  );
}
