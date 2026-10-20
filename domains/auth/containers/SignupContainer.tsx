'use client'; // 입력값 기억과 클릭 처리를 하는 경계

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const [values, setValues] = useState<SignupValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<SignupValues>>({});

  // 입력칸·체크박스가 바뀔 때: 값을 바꾸고, 그 칸의 오류는 지움
  const handleChange = (field: keyof SignupValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // "가입 완료 후 로그인" 버튼을 눌렀을 때
  const handleSubmit = () => {
    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return; // 오류가 있으면 여기서 멈춤

    // TODO: 회원가입 API가 생기면 여기서 가입 요청
    // 지금은 시안 범위(구조 검토용)에 맞춰 로그인 화면으로 이동만 함
    router.push(withNext('/login', redirectTo));
  };

  return (
    <SignupForm
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}