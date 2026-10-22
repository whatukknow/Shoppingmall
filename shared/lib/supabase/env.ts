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
