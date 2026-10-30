import type { FieldErrors, LoginValues, SignupValues } from './auth.types';

// 비밀번호 최소 길이 (정책 확정 전 임시 기준)
const PASSWORD_MIN_LENGTH = 8;

// 이메일 형식 검사: '글자@글자.글자' 모양인지
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// 이메일 칸 검사 (로그인·회원가입 공통)
const checkEmail = (email: string) => {
  if (!email.trim()) return 'Enter your email.';
  if (!isEmail(email)) return 'Enter a valid email address.';
  return undefined;
};

// 로그인 검사
export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  const emailError = checkEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) errors.password = 'Enter your password.';

  return errors;
}

// 회원가입 검사
export function validateSignup(
  values: SignupValues,
): FieldErrors<SignupValues> {
  const errors: FieldErrors<SignupValues> = {};

  if (!values.name.trim()) errors.name = 'Enter your name.';

  const emailError = checkEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) {
    errors.password = 'Enter your password.';
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters for your password.`;
  }

  if (!values.passwordConfirm) {
    errors.passwordConfirm = 'Confirm your password.';
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match.';
  }

  if (!values.agreeTerms)
    errors.agreeTerms = 'Please accept the terms of service.';
  if (!values.agreePrivacy)
    errors.agreePrivacy = 'Please accept the privacy policy.';
  // agreeNotification(알림 수신)은 선택이라 검사하지 않음

  return errors;
}

// 오류가 하나라도 있는지
export const hasErrors = <T>(errors: FieldErrors<T>) =>
  Object.keys(errors).length > 0;
