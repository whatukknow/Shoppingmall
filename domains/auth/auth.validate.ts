import type { FieldErrors, LoginValues, SignupValues } from './auth.types';

// 비밀번호 최소 길이 (정책 확정 전 임시 기준)
const PASSWORD_MIN_LENGTH = 8;

// 이메일 형식 검사: '글자@글자.글자' 모양인지
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// 이메일 칸 검사 (로그인·회원가입 공통)
const checkEmail = (email: string) => {
  if (!email.trim()) return '이메일을 입력해 주세요.';
  if (!isEmail(email)) return '이메일 형식을 확인해 주세요.';
  return undefined;
};

// 로그인 검사
export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  const emailError = checkEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) errors.password = '비밀번호를 입력해 주세요.';

  return errors;
}

// 회원가입 검사
export function validateSignup(
  values: SignupValues,
): FieldErrors<SignupValues> {
  const errors: FieldErrors<SignupValues> = {};

  if (!values.name.trim()) errors.name = '이름을 입력해 주세요.';

  const emailError = checkEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) {
    errors.password = '비밀번호를 입력해 주세요.';
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`;
  }

  if (!values.passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 서로 달라요.';
  }

  if (!values.agreeTerms) errors.agreeTerms = '이용약관 확인이 필요해요.';
  if (!values.agreePrivacy)
    errors.agreePrivacy = '개인정보 안내 확인이 필요해요.';
  // agreeNotification(알림 수신)은 선택이라 검사하지 않음

  return errors;
}

// 오류가 하나라도 있는지
export const hasErrors = <T>(errors: FieldErrors<T>) =>
  Object.keys(errors).length > 0;
