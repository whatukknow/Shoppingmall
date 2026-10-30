'use client'; // 입력칸·체크박스 이벤트를 받는 부품

import { Button, FormField } from '@/shared/components';
import type { FieldErrors, SignupValues } from '../auth.types';

type SignupFormProps = {
  values: SignupValues;
  errors: FieldErrors<SignupValues>;
  onChange: (field: keyof SignupValues, value: string | boolean) => void;
  onSubmit: () => void;
  isPending?: boolean; // 제출 대기 중 (버튼 비활성화)
};

// 동의 체크박스 한 줄 (이 파일 안에서만 씀)
type AgreementProps = {
  label: string;
  required: boolean;
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
};

function Agreement({
  label,
  required,
  checked,
  error,
  onChange,
}: AgreementProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          className="accent-primary size-5"
        />
        <span>
          <span
            className={
              required ? 'text-primary font-bold' : 'text-muted-foreground'
            }
          >
            {required ? '[Required]' : '[Optional]'}
          </span>{' '}
          {label}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

// 회원가입 카드: 이름·이메일·비밀번호·비밀번호 확인 + 동의 3개
export function SignupForm({
  values,
  errors,
  onChange,
  onSubmit,
  isPending = false,
}: SignupFormProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="border-foreground/20 flex flex-col gap-5 border p-6 sm:p-8"
    >
      <h2 className="text-2xl font-bold">Sign up</h2>

      <FormField
        label="Name"
        autoComplete="name"
        placeholder="Enter your name"
        value={values.name}
        onChange={(event) => onChange('name', event.target.value)}
        error={errors.name}
        required
      />

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
        autoComplete="new-password"
        placeholder="Enter your password"
        description="Use at least 8 characters."
        value={values.password}
        onChange={(event) => onChange('password', event.target.value)}
        error={errors.password}
        required
      />

      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password again"
        value={values.passwordConfirm}
        onChange={(event) => onChange('passwordConfirm', event.target.value)}
        error={errors.passwordConfirm}
        required
      />

      <fieldset className="border-foreground/20 flex flex-col gap-1 border-t pt-4">
        <legend className="sr-only">Consent</legend>
        <Agreement
          label="I agree to the terms of service"
          required
          checked={values.agreeTerms}
          error={errors.agreeTerms}
          onChange={(checked) => onChange('agreeTerms', checked)}
        />
        <Agreement
          label="I agree to the privacy policy"
          required
          checked={values.agreePrivacy}
          error={errors.agreePrivacy}
          onChange={(checked) => onChange('agreePrivacy', checked)}
        />
        <Agreement
          label="Send me notifications"
          required={false}
          checked={values.agreeNotification}
          onChange={(checked) => onChange('agreeNotification', checked)}
        />
      </fieldset>

      <Button
        type="submit"
        size="touch"
        className="w-full"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? 'Creating account…' : 'Create account and log in'}
      </Button>
    </form>
  );
}
