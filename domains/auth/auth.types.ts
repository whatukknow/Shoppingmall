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

// 입력칸별 오류 메시지. 예: { email: '이메일 형식이 아니에요' }
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

// 회원 정보 화면에 보여줄 회원 정보
export type Member = {
  name: string;
  email: string;
  deliveryInfo?: string; // 기본 수령 정보 (없을 수 있음)
};