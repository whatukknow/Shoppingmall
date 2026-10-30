export type ApiErrorCode = 'INVALID_RESPONSE' | 'INTERNAL_ERROR' | 'HTTP_ERROR';

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

function buildQuery(params?: RequestParams): string {
  if (!params) return '';
  return Object.entries(params)
    .filter(([key]) => key.length > 0)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const cleanPath = path.replace(/^\/+/, '');
  try {
    const { params, headers, ...initBase } = options;
    const jsonBody: string | undefined =
      body !== undefined ? JSON.stringify(body) : undefined;

    const query = buildQuery(params);
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        fetchHeaders[key] = value;
      });
    } else if (Array.isArray(headers)) {
      for (const [key, value] of headers) fetchHeaders[key] = value;
    } else if (headers) {
      Object.assign(fetchHeaders, headers);
    }

    // 서버 컴포넌트(SSR)에서는 상대 URL fetch 가 불가하므로 절대 URL 을 만든다.
    // next/headers 는 브라우저 번들에서 import 하면 안 되므로 여기서만 동적 import 한다.
    let url = `/api/${cleanPath}${query ? `?${query}` : ''}`;
    if (typeof window === 'undefined') {
      const loader = nextHeadersLoader ?? (() => import('next/headers'));
      const getHeaders = (await loader()).headers;
      const h = await getHeaders();
      const proto = h.get('x-forwarded-proto') ?? 'http';
      const host = h.get('host') ?? `localhost:${process.env.PORT ?? 3000}`;
      fetchHeaders['Cookie'] = h.get('cookie') ?? '';
      initBase.cache = 'no-store';
      url = `${proto}://${host}${url}`;
    }

    const response = await fetch(url, {
      ...initBase,
      method,
      headers: fetchHeaders,
      body: jsonBody,
    });
    return await handleLiveResponse<T>(response);
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
