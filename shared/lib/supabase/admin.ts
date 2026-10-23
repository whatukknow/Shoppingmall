import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSecretKey, supabaseEnv } from './env';
import type { Database } from './database.types';

// admin client 는 서버 전용이다. 브라우저 번들에 포함되면 시크릿 키 유출 위험이 있다.
if (typeof window !== 'undefined') {
  throw new Error('admin client 는 서버 전용');
}

/**
 * RLS 우회 시크릿 키로 만드는 관리자 클라이언트.
 * 호출 전에 반드시 세션으로 사용자를 확인하고, 쓰기는 그 사용자 id 로 한정할 것.
 */
export function createAdminClient(): SupabaseClient<Database> {
  return createClient(supabaseEnv.url, getSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
