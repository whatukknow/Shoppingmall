import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  ApiError,
  apiClient,
  __setNextHeadersLoader,
} from '../../shared/lib/client';

describe('live api client', () => {
  let fetchCalls: {
    url: string;
    init: RequestInit | undefined;
    method?: string;
  }[] = [];
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchCalls = [];
    // node 테스트 환경은 typeof window === 'undefined' 이므로 서버 분기로 간다.
    // 실제 next/headers 는 요청 스코프 밖에서 throw 하므로 기본 주입으로 대역을 둔다.
    __setNextHeadersLoader(async () => ({
      headers: () => ({ get: () => null }),
    }));
    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      fetchCalls.push({
        url: String(input),
        init,
        method: init?.method ?? 'GET',
      });
      const body =
        typeof init?.body === 'string'
          ? init.body
          : JSON.stringify({ data: {} });
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }) as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    __setNextHeadersLoader(undefined);
  });

  it('GET 은 서버 분기에서 localhost origin 의 /api 경로로 fetch 한다', async () => {
    await apiClient.get('products', { params: { type: 'random', limit: 5 } });
    assert.equal(fetchCalls.length, 1);
    assert.equal(
      fetchCalls[0].url,
      'http://localhost:3000/api/products?type=random&limit=5',
    );
    assert.equal(fetchCalls[0].init?.cache, 'no-store');
  });

  it('비 2xx 응답은 HTTP_ERROR ApiError 로 변환된다', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { message: 'internal' } }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }) as Response) as unknown as typeof fetch;

    await assert.rejects(
      () => apiClient.get('products/pc-001'),
      (e: unknown) => {
        assert.ok(e instanceof ApiError);
        assert.equal(e.status, 500);
        assert.equal(e.code, 'HTTP_ERROR');
        assert.equal(e.message, 'internal');
        return true;
      },
    );
  });

  it('라이브 POST 는 fetch 에 method·body·headers·Content-Type 을 전달한다', async () => {
    const payload = { name: '테스트 상품' };
    await apiClient.post('products', payload, {
      headers: { 'x-custom': 'yes' },
      signal: undefined,
    });
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0].method, 'POST');
    assert.equal(fetchCalls[0].init?.body, JSON.stringify(payload));
    assert.equal(
      fetchCalls[0].init?.headers &&
        (fetchCalls[0].init.headers as Record<string, string>)['x-custom'],
      'yes',
    );
  });

  it('서버 분기(테스트 주입 next/headers): 절대 URL·Cookie 헤더·cache no-store', async () => {
    // 테스트 주입: next/headers 대역 — x-forwarded-proto/x-forwarded-host 호스트에서 쿠키를 읽어온다
    __setNextHeadersLoader(async () => {
      const map = new Map<string, string>([
        ['x-forwarded-proto', 'https'],
        ['host', 'shop.example.com'],
        ['cookie', 'session=abc; cart=x'],
      ]);
      return {
        headers: () => ({ get: (name: string) => map.get(name) ?? null }),
      };
    });
    try {
      await apiClient.get('products', { params: { limit: 3 } });
      assert.equal(fetchCalls.length, 1);
      assert.equal(
        fetchCalls[0].url,
        'https://shop.example.com/api/products?limit=3',
      );
      const headers = fetchCalls[0].init?.headers as Record<string, string>;
      assert.equal(headers['Cookie'], 'session=abc; cart=x');
      assert.equal(fetchCalls[0].init?.cache, 'no-store');
    } finally {
      __setNextHeadersLoader(undefined);
    }
  });

  it('서버 분기: 프록시 헤더 없으면 PORT 기반 localhost origin 을 쓴다', async () => {
    __setNextHeadersLoader(async () => ({
      headers: () => ({ get: () => null }),
    }));
    try {
      await apiClient.get('users/me');
      assert.equal(fetchCalls.length, 1);
      assert.ok(fetchCalls[0].url.startsWith('http://localhost:3000/api/'));
      assert.equal(
        fetchCalls[0].init?.headers &&
          (fetchCalls[0].init.headers as Record<string, string>)['Cookie'],
        '',
      );
    } finally {
      __setNextHeadersLoader(undefined);
    }
  });

  it('브라우저 분기(window 존재): 상대 URL 을 유지한다', async () => {
    globalThis.window = {} as Window & typeof globalThis;
    try {
      await apiClient.get('products');
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, '/api/products');
    } finally {
      // @ts-expect-error 테스트용 정리
      delete globalThis.window;
    }
  });

  it('브라우저 분기에서는 next/headers 주입이 있어도 절대 URL 로 가지 않는다', async () => {
    globalThis.window = {} as Window & typeof globalThis;
    __setNextHeadersLoader(async () => {
      const map = new Map<string, string>([
        ['x-forwarded-proto', 'https'],
        ['host', 'shop.example.com'],
      ]);
      return {
        headers: () => ({ get: (name: string) => map.get(name) ?? null }),
      };
    });
    try {
      await apiClient.get('products');
      assert.equal(fetchCalls[0].url, '/api/products');
    } finally {
      // @ts-expect-error 테스트용 정리
      delete globalThis.window;
      __setNextHeadersLoader(undefined);
    }
  });
});
