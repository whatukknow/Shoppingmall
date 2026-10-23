import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co';

const RESTORE_WINDOW = globalThis.window;
after(() => {
  if (RESTORE_WINDOW === undefined) {
    // @ts-expect-error 테스트 격리를 위한 전역 복원
    delete globalThis.window;
  } else {
    globalThis.window = RESTORE_WINDOW;
  }
});

describe('supabase env getSecretKey', () => {
  it('SUPABASE_SECRET_KEY 가 없으면 throw 한다', async () => {
    const prev = process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    try {
      const { getSecretKey } = await import('../../shared/lib/supabase/env');
      assert.throws(() => getSecretKey(), /SUPABASE_SECRET_KEY 미설정/);
    } finally {
      if (prev !== undefined) process.env.SUPABASE_SECRET_KEY = prev;
    }
  });

  it('SUPABASE_SECRET_KEY 가 있으면 그 값을 돌려준다', async () => {
    process.env.SUPABASE_SECRET_KEY = 'test-secret-value';
    try {
      const { getSecretKey } = await import('../../shared/lib/supabase/env');
      assert.equal(getSecretKey(), 'test-secret-value');
    } finally {
      delete process.env.SUPABASE_SECRET_KEY;
    }
  });
});

describe('supabase admin client', () => {
  it('브라우저 환경(window 존재)에서 모듈 import 시 throw 한다', async () => {
    // @ts-expect-error 테스트를 위한 브라우저 흉내
    globalThis.window = {};
    try {
      await assert.rejects(
        // @ts-expect-error 테스트 전용 캐시 분리 조회 파라미터
        import('../../shared/lib/supabase/admin?browser'),
        /admin client 는 서버 전용/,
      );
    } finally {
      // @ts-expect-error 테스트 격리 복원
      delete globalThis.window;
    }
  });

  it('키가 설정돼 있으면 관리자 클라이언트를 만들고 URL 이 일치한다', async () => {
    process.env.SUPABASE_SECRET_KEY = 'test-secret-value';
    try {
      const { createAdminClient } =
        await import('../../shared/lib/supabase/admin');
      const client = createAdminClient();
      const { supabaseEnv } = await import('../../shared/lib/supabase/env');
      assert.equal(
        (client as unknown as { supabaseUrl: string }).supabaseUrl,
        supabaseEnv.url,
      );
    } finally {
      delete process.env.SUPABASE_SECRET_KEY;
    }
  });

  it('세션을 영속하지 않는다 (persistSession: false)', async () => {
    process.env.SUPABASE_SECRET_KEY = 'test-secret-value';
    try {
      const { createAdminClient } =
        await import('../../shared/lib/supabase/admin');
      const client = createAdminClient();
      const { data } = await client.auth.getSession();
      assert.equal(data.session, null);
    } finally {
      delete process.env.SUPABASE_SECRET_KEY;
    }
  });

  it('키가 없으면 createAdminClient 도 throw 한다', async () => {
    delete process.env.SUPABASE_SECRET_KEY;
    const { createAdminClient } =
      await import('../../shared/lib/supabase/admin');
    assert.throws(() => createAdminClient(), /SUPABASE_SECRET_KEY 미설정/);
  });
});
