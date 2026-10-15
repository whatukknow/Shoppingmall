import fetchMockup from './mockup/fetchMockup';

export type ApiErrorCode =
  'MOCKUP_NOT_FOUND' | 'INVALID_RESPONSE' | 'INTERNAL_ERROR';

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

// 실제 URL로 요청 시 queryString 생성 지원.
function buildUrl(path: string, params?: QueryParams): string {
  // TODO: fetch로 구현해야한다면 base_url을 env에 설정하여 전체 주소를 만들어야한다. 하지만 지금은 path와 params로만 mockup을 구분할 예정이다.
  const url = new URL(path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (key) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

function buildMockupUrl(path: string, params?: QueryParams): string {
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

    const mockupUrl = buildMockupUrl(path, params);
    const data = fetchMockup(method, mockupUrl, jsonBody);

    if (data === undefined) {
      throw new ApiError(
        404,
        'MOCKUP_NOT_FOUND',
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
