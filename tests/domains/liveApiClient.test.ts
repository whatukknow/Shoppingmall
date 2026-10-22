import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { ApiError, apiClient } from '../../shared/lib/client';

describe('live api client (NEXT_PUBLIC_LIVE_API)', () => {
  let fetchCalls: {
    url: string;
    init: RequestInit | undefined;
    method?: string;
  }[] = [];
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_LIVE_API;

  beforeEach(() => {
    fetchCalls = [];
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
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_LIVE_API;
    else process.env.NEXT_PUBLIC_LIVE_API = originalEnv;
  });

  it('미설정이면 전부 목업(fetch 미호출, 기본 OFF)', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = undefined as unknown as string;
    // 목업 지연(1.5s)을 짧게 유지하기 위해 에러 여부와 무관하게 fetch 미호출만 검증한다
    await apiClient.get('products').catch(() => undefined);
    assert.equal(fetchCalls.length, 0);
  });

  it('패턴에 매칭되는 GET 은 /api 경로로 fetch 한다', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = 'products';
    await apiClient.get('products', { params: { type: 'random', limit: 5 } });
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0].url, '/api/products?type=random&limit=5');
    assert.equal(fetchCalls[0].method, 'GET');
  });

  it('동적 세그먼트 :id 는 한 세그먼트만 매칭한다', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = 'products,products/:id';
    assert.equal(fetchCalls.length, 0, '사전 조건: 아직 호출 없음');
    await apiClient.get('products/pc-001');
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0].url, '/api/products/pc-001');

    // 세그먼트 2개 경로는 매칭되지 않아 목업으로 간다(에러 여부 무관, fetch 미호출)
    fetchCalls = [];
    await apiClient.get('products/x/pods').catch(() => undefined);
    assert.equal(fetchCalls.length, 0);
  });

  it('패턴에 없는 메서드·경로는 목업으로 간다', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = 'GET products';
    await apiClient.post('products', {}).catch(() => undefined);
    assert.equal(fetchCalls.length, 0);

    fetchCalls = [];
    await apiClient
      .get('users/me/product-recommendations')
      .catch(() => undefined);
    assert.equal(fetchCalls.length, 0);
  });

  it('METHOD 명시 패턴은 같은 메서드만 매칭한다', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = 'GET products';
    await apiClient.get('products');
    assert.equal(fetchCalls.length, 1);
  });

  it('비 2xx 응답은 HTTP_ERROR ApiError 로 변환된다', async () => {
    process.env.NEXT_PUBLIC_LIVE_API = 'products/:id';
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
    process.env.NEXT_PUBLIC_LIVE_API = 'POST products';
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
});
