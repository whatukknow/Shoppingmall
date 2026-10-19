'use client';

import Link from 'next/link';
import { Button, FormField } from '@/shared/components';
import type { FieldErrors, LoginValues } from '../auth.types';

type LoginFormProps = {
  values: LoginValues;
  errors: FieldErrors<LoginValues>;
  onChange: (field: keyof LoginValues, value: string) => void;
  onSubmit: () => void;
  signupHref: string;
};

// 로그인 카드: "다시 만나 반가워요" + 이메일·비밀번호 + 로그인/회원가입
// 'use client' 없음. 받은 값대로 그리기만 함
export function LoginForm({
  values,
  errors,
  onChange,
  onSubmit,
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
      <h2 className="text-2xl font-bold">다시 만나 반가워요</h2>

      <FormField
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="이메일을 입력해 주세요"
        value={values.email}
        onChange={(event) => onChange('email', event.target.value)}
        error={errors.email}
        required
      />

      <FormField
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해 주세요"
        value={values.password}
        onChange={(event) => onChange('password', event.target.value)}
        error={errors.password}
        required
      />

      <Button type="submit" size="touch" className="w-full">
        로그인
      </Button>

      <Link
        href={signupHref}
        className="border-primary text-primary hover:bg-primary/5 flex min-h-12 w-full items-center justify-center border text-sm font-medium"
      >
        회원가입
      </Link>

      <p className="text-muted-foreground text-center text-sm">
        아이디·비밀번호 찾기는 준비 중이에요.
      </p>
    </form>
  );
}