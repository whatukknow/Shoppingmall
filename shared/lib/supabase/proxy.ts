import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseEnv } from './env';
import type { Database } from './database.types';

/**
 * proxy.ts 에서 세션 쿠키를 갱신하는 @supabase/ssr 공식 패턴입니다.
 * 리다이렉트 금지 — 온보딩·진입 흐름 보존을 위해 요청을 그대로 통과시킵니다.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 세션 갱신을 트리거하기 위해 반드시 호출해야 합니다.
  // 네트워크 오류 등으로 getUser 가 실패해도 요청을 차단하지 않습니다.
  try {
    await supabase.auth.getUser();
  } catch {
    // 세션 갱신 실패는 요청 통과에 영향을 주지 않습니다.
  }

  return response;
}
