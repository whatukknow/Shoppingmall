import { createBrowserClient } from '@supabase/ssr';
import { supabaseEnv } from './env';
import type { Database } from './database.types';

// 클라이언트 컴포넌트에서 참조할 싱글톤 브라우저 Supabase 인스턴스
export const supabase = createBrowserClient<Database>(
  supabaseEnv.url,
  supabaseEnv.publishableKey,
);
