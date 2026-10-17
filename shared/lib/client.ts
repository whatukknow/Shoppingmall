import fetchMockup from './mockup/fetchMockup';

/** 목업 API 호출에서 발생할 수 있는 오류 분류입니다. */
export type ApiErrorCode =
  'MOCKUP_NOT_FOUND' | 'INVALID_RESPONSE' | 'INTERNAL_ERROR';

/** HTTP 상태, 오류 코드와 추가 응답 데이터를 보존하는 API 오류입니다. */
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

/** URL 쿼리에 직렬화할 수 있는 단순 값 목록입니다. */
type QueryParams = Record<string, string | boolean | number>;

/** fetch 옵션에 API 쿼리 파라미터를 더한 요청 설정입니다. */
type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: QueryParams;
};

/** 실제 요청 경로에 인코딩된 쿼리 문자열을 붙입니다. */
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

/** 목업 조회 키에 쿼리 파라미터를 안정적으로 붙입니다. */
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

/** 등록된 목업 응답을 읽고 JSON과 오류 형식을 공통 처리합니다. */
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

/** HTTP 메서드별 타입 지정 목업 요청 함수를 제공합니다. */
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
