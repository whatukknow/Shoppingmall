'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_PREVIEW_SESSION_KEY } from '@/domains/auth/data/authPreviewSession';
import {
  consumeSignupAttemptToken,
  readSignupAttemptToken,
  signIn,
} from '@/domains/auth/auth.api';
import { LoginForm } from '@/domains/auth/components/LoginForm';
import { hasErrors, validateLogin } from '@/domains/auth/auth.validate';
import { withNext } from '@/domains/auth/auth.redirect';
import type { FieldErrors, LoginValues } from '@/domains/auth/auth.types';
import { ApiError } from '@/shared/lib/client';
import { trackSignUp } from '@/shared/lib/analytics/client';

const LOGIN_MISMATCH_MESSAGE = 'Incorrect email or password.';
const LOGIN_UNKNOWN_MESSAGE = 'Could not log in. Please try again shortly.';

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
  const submitting = useRef(false);

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
    if (submitting.current) return;
    setFormError(null); // 재제출을 시작하면 이전 실패 안내는 지움
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return; // 오류가 있으면 여기서 멈춤

    submitting.current = true;
    startTransition(async () => {
      try {
        const signupAttemptToken = readSignupAttemptToken();
        const response = await signIn({
          email: values.email,
          password: values.password,
          ...(signupAttemptToken ? { signupAttemptToken } : {}),
        });

        if (
          signupAttemptToken &&
          response.data.signUpAnalyticsEligible === true &&
          consumeSignupAttemptToken(signupAttemptToken)
        ) {
          try {
            trackSignUp();
          } catch {
            // 분석 전송 장애가 인증 완료와 이동을 막지 않게 한다.
          }
        }

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
      } finally {
        submitting.current = false;
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
