import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseEnv } from './env';
import type { Database } from './database.types';

// 서버 컴포넌트(RSC), Server Actions, Route Handler 및 proxy에서 호출하는 쿠키 연동 Supabase 클라이언트 팩토리 함수
export function createServerClient(): SupabaseClient<Database> {
  return createSSRServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.publishableKey,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // 서버 컴포넌트(RSC) 렌더링 중 쿠키 쓰기 시도는 무시하고
            // Server Actions 및 Proxy에서 쿠키 갱신을 처리합니다.
          }
        },
      },
    },
  );
}
