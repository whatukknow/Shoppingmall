'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_PREVIEW_SESSION_KEY } from '@/domains/auth/data/authPreviewSession';
import { signIn } from '@/domains/auth/auth.api';
import { LoginForm } from '@/domains/auth/components/LoginForm';
import { hasErrors, validateLogin } from '@/domains/auth/auth.validate';
import { withNext } from '@/domains/auth/auth.redirect';
import type { FieldErrors, LoginValues } from '@/domains/auth/auth.types';
import { ApiError } from '@/shared/lib/client';

const LOGIN_MISMATCH_MESSAGE = '이메일과 비밀번호가 일치하지 않습니다.';
const LOGIN_UNKNOWN_MESSAGE =
  '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.';

// 로그인 실패 오류를 사용자에게 보여줄 안내 문구로 바꾼다
export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 401 ? LOGIN_MISMATCH_MESSAGE : error.message;
  }
  return LOGIN_UNKNOWN_MESSAGE;
}

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
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // 비동기 대기 중 중복 제출 차단

  // 입력칸이 바뀔 때: 값을 바꾸고, 그 칸의 오류는 지움
  const handleChange = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null); // 입력값을 바꾸면 로그인 실패 안내도 지움
  };

  // 로그인 버튼을 눌렀을 때
  const handleSubmit = () => {
    setFormError(null); // 재제출을 시작하면 이전 실패 안내는 지움
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
        router.refresh(); // 레이아웃 서버 데이터(MastHead 로그인 상태) 갱신
      } catch (error) {
        setFormError(loginErrorMessage(error));
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
      formError={formError ?? undefined}
      signupHref={withNext('/signup', redirectTo)}
    />
  );
}
