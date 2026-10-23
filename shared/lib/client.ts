import fetchMock from './mock/fetchMock';
import { waitMockDelay } from './mock/mockDelay';

export type ApiErrorCode =
  | 'MOCK_NOT_FOUND'
  | 'MOCK_ERROR'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR'
  | 'HTTP_ERROR';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestParams = Record<string, string | boolean | number>;

type NextHeadersModule = {
  headers: () =>
    | { get(name: string): string | null }
    | Promise<{ get(name: string): string | null }>;
};

/**
 * 서버 분기에서 쓰는 next/headers 로더. 브라우저 번들에 정적 import 가 섞이지
 * 않도록 동적 import 만 쓰고, 테스트에서는 이 주입 지점으로 모킹한다.
 */
let nextHeadersLoader: (() => Promise<NextHeadersModule>) | undefined;

/** 테스트 전용: next/headers 모듈 로더를 교체한다 */
export function __setNextHeadersLoader(
  loader: (() => Promise<NextHeadersModule>) | undefined,
): void {
  nextHeadersLoader = loader;
}

async function handleLiveResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = `요청 실패: ${response.status}`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (typeof parsed?.error?.message === 'string') {
        message = parsed.error.message;
      }
    } catch {
      // 응답 본문이 JSON 이 아니면 기본 메시지를 쓴다
    }
    throw new ApiError(response.status, 'HTTP_ERROR', message, text);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      502,
      'INVALID_RESPONSE',
      '응답 JSON 형식이 올바르지 않습니다.',
      text,
    );
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: RequestParams;
};

function buildMockUrl(path: string, params?: RequestParams): string {
  if (!params) return path;

  const query = Object.entries(params)
    .filter(([key]) => key.length > 0)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');

  return query ? `${path}?${query}` : path;
}

/**
 * NEXT_PUBLIC_LIVE_API 에 명시된 엔드포인트만 실제 /api 로 보내기 위한 라이브 판정.
 * 쉼표 구분 패턴: "GET products, products/:id" 처럼 METHOD 생략 가능(생략 시 전 메소드). 패턴 ":id" 는 한 세그먼트만 매칭.
 * 미설정이면 전부 목업(기본 OFF).
 */
export function isLiveEndpoint(method: string, path: string): boolean {
  const spec = process.env.NEXT_PUBLIC_LIVE_API;
  if (!spec || spec.trim().length === 0) return false;

  // 전체 전환 스위치: '*' 면 라우트 패턴 파싱 없이 모든 엔드포인트 실연결
  if (spec.trim() === '*') return true;
  const pathSegments = path.split('/').filter((s) => s.length > 0);

  return parseLivePatterns(spec).some(({ method: patternMethod, segments }) => {
    if (patternMethod && patternMethod !== method.toUpperCase()) return false;
    const concrete = pathSegments.filter((s) => !s.includes('?'));
    if (segments.length !== concrete.length) return false;
    return segments.every((seg, i) =>
      seg.startsWith(':') ? concrete[i].length > 0 : seg === concrete[i],
    );
  });
}

function parseLivePatterns(
  spec: string,
): { method: string | null; segments: string[] }[] {
  return spec
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [maybeMethod, maybePath] = entry.split(/\s+/);
      if (maybePath) {
        return {
          method: maybeMethod.toUpperCase(),
          segments: maybePath.split('/').filter((s) => s.length > 0),
        };
      }
      return {
        method: null,
        segments: maybeMethod.split('/').filter((s) => s.length > 0),
      };
    });
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  try {
    const { params } = options;
    const jsonBody: string | undefined =
      body !== undefined ? JSON.stringify(body) : undefined;

    if (isLiveEndpoint(method, path)) {
      const query = params
        ? Object.entries(params)
            .filter(([key]) => key.length > 0)
            .map(
              ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
            )
            .join('&')
        : '';
      const fetchHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          fetchHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        for (const [key, value] of options.headers) fetchHeaders[key] = value;
      } else if (options.headers) {
        Object.assign(fetchHeaders, options.headers);
      }
      const { headers: _oHeaders, ...initBase } = options;
      void _oHeaders;

      // 서버 컴포넌트(SSR)에서는 상대 URL fetch 가 불가하므로 절대 URL 을 만든다.
      // next/headers 는 브라우저 번들에서 import 하면 안 되므로 여기서만 동적 import 한다.
      if (typeof window === 'undefined') {
        const loader = nextHeadersLoader ?? (() => import('next/headers'));
        const getHeaders = (await loader()).headers;
        const h = await getHeaders();
        const proto = h.get('x-forwarded-proto') ?? 'http';
        const host = h.get('host') ?? `localhost:${process.env.PORT ?? 3000}`;
        fetchHeaders['Cookie'] = h.get('cookie') ?? '';
        initBase.cache = 'no-store';
        const baseUrl = `${proto}://${host}`;
        const response = await fetch(
          `${baseUrl}/api/${path}${query ? `?${query}` : ''}`,
          {
            ...initBase,
            method,
            headers: fetchHeaders,
            body: jsonBody,
          } as RequestInit,
        );
        return await handleLiveResponse<T>(response);
      }

      const response = await fetch(`/api/${path}${query ? `?${query}` : ''}`, {
        ...initBase,
        method,
        headers: fetchHeaders,
        body: jsonBody,
      } as RequestInit);
      return await handleLiveResponse<T>(response);
    }

    const mockUrl = buildMockUrl(path, params);
    await waitMockDelay();
    const data = fetchMock(method, mockUrl, jsonBody);

    if (data === undefined) {
      throw new ApiError(
        404,
        'MOCK_NOT_FOUND',
        `목데이터를 찾을 수 없습니다: ${method} ${path}`,
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch {
      throw new ApiError(
        502,
        'INVALID_RESPONSE',
        '목데이터 JSON 형식이 올바르지 않습니다.',
        data,
      );
    }

    // 목업이 에러 마커면 ApiError 로 바꿔 던진다
    const marker = (
      json as { __mockError?: { status?: number; message?: string } }
    ).__mockError;
    if (
      marker &&
      typeof marker === 'object' &&
      typeof marker.status === 'number'
    ) {
      throw new ApiError(
        marker.status,
        'MOCK_ERROR',
        marker.message ?? '목업 오류',
        json,
      );
    }

    return json as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;

    if (e instanceof Error) {
      throw new ApiError(500, 'INTERNAL_ERROR', e.message, e);
    }

    throw new ApiError(
      500,
      'INTERNAL_ERROR',
      `공통 오류 확인 필요: ${String(e)}`,
      e,
    );
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
