import fetchMock from './mock/fetchMock';
import { waitMockDelay } from './mock/mockDelay';

export type ApiErrorCode =
  'MOCK_NOT_FOUND' | 'MOCK_ERROR' | 'INVALID_RESPONSE' | 'INTERNAL_ERROR';

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
