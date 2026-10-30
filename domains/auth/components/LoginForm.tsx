'use client';

import Link from 'next/link';
import { Button, FormField } from '@/shared/components';
import type { FieldErrors, LoginValues } from '../auth.types';

type LoginFormProps = {
  values: LoginValues;
  errors: FieldErrors<LoginValues>;
  onChange: (field: keyof LoginValues, value: string) => void;
  onSubmit: () => void;
  isPending?: boolean; // 제출 대기 중 (버튼 비활성화)
  formError?: string; // 로그인 실패 안내 문구
  signupHref: string;
};

// 로그인 카드: "Welcome back" + 이메일·비밀번호 + 로그인/회원가입
// 'use client' 없음. 받은 값대로 그리기만 함
export function LoginForm({
  values,
  errors,
  onChange,
  onSubmit,
  isPending = false,
  formError,
  signupHref,
}: LoginFormProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault(); // 페이지 새로고침 막기
        onSubmit();
      }}
      className="border-foreground/20 flex flex-col gap-5 border p-6 sm:p-8"
    >
      <h2 className="text-2xl font-bold">Welcome back</h2>

      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={values.email}
        onChange={(event) => onChange('email', event.target.value)}
        error={errors.email}
        required
      />

      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={values.password}
        onChange={(event) => onChange('password', event.target.value)}
        error={errors.password}
        required
      />

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        size="touch"
        className="w-full"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? 'Logging in…' : 'Log in'}
      </Button>

      <Link
        href={signupHref}
        className="border-primary text-primary hover:bg-primary/5 flex min-h-12 w-full items-center justify-center border text-sm font-medium"
      >
        Sign up
      </Link>

      <p className="text-muted-foreground text-center text-sm">
        Account recovery is coming soon.
      </p>
    </form>
  );
}
