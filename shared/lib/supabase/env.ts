const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.',
  );
}

/** Supabase 프로젝트 URL */
export const supabaseEnv = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
};

/**
 * Supabase 시크릿 키 (RLS 우회). 서버 전용 — 필요한 시점에 호출해 읽는다.
 * 모듈 로드 시점에 읽지 않는다 (브라우저 번들에서 평가되지 않게).
 */
export function getSecretKey(): string {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY 미설정');
  }
  return secretKey;
}
