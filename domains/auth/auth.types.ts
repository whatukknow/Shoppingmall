// 회원 화면(로그인, 회원가입, 회원 정보)이 쓰는 데이터 모양

// 로그인 입력값
export type LoginValues = {
  email: string;
  password: string;
};

// 회원가입 입력값
export type SignupValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean; // 필수 이용약관
  agreePrivacy: boolean; // 필수 개인정보 안내
  agreeNotification: boolean; // 선택 알림 수신
};

// 로그인 API 요청
export type SignInRequest = {
  email: string;
  password: string;
};

// 로그인 API 응답
export type SignInResponse = {
  id: string;
  name: string;
  email: string;
  defaultAddress: string | null; // 기본 주소 (미등록이면 null)
  hasTasteProfile: boolean; // 취향 프로필 등록 여부
  expiresAt: string; // 세션 만료 시각 (ISO 문자열)
  requestId: string;
};

// 로그아웃 API 응답
export type SignOutResponse = {
  signedOut: boolean;
  requestId: string;
};

// 회원가입 API 요청 (약관 버전 동봉)
export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
  termsVersion: string; // 동의한 이용약관 버전
  privacyVersion: string; // 동의한 개인정보 처리방침 버전
  agreeTerms: boolean; // 필수 이용약관
  agreePrivacy: boolean; // 필수 개인정보 안내
  agreeNotification: boolean; // 선택 알림 수신
};

// 회원가입 API 응답 (비밀번호·요청 식별자는 돌려주지 않는다)
export type SignUpResponse = {
  id: string;
  name: string;
  email: string;
  termsVersion: string;
  privacyVersion: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeNotification: boolean;
};

// 약관 버전 상수
export const TERMS_VERSION = '2026-10'; // 이용약관 버전
export const PRIVACY_VERSION = '2026-10'; // 개인정보 처리방침 버전

// 입력칸별 오류 메시지. 예: { email: '이메일 형식이 아니에요' }
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

// 회원 정보 화면에 보여줄 회원 정보 — users/me 연결로 User 타입(domains/auth/users.types.ts) 사용
