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

type QueryParams = Record<string, string | boolean | number>;

type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: QueryParams;
};

function buildMockUrl(path: string, params?: QueryParams): string {
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
      const { headers, ...initBase } = options;
      const response = await fetch(`/api/${path}${query ? `?${query}` : ''}`, {
        ...initBase,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: jsonBody,
      } as RequestInit);
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
