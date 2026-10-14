import fetchMockup from './mockup/fetchMockup';

// TODO: API Error Code 정의 필요. 현재는 구분 없이 0으로 고정
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
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
  let url = path;

  if (params) {
    let querys = '';
    Object.entries(params).forEach(([key, value]) => {
      if (key) {
        querys += `${key}=${String(value)}`;
      }
    });
    url = `${url}?${querys}`;
  }

  return url;
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

    const data = fetchMockup(method, buildMockupUrl(path, params), jsonBody);
    const json = data && JSON.parse(data);

    if (!json) {
      throw new ApiError(0, 'JSON 없음');
    }

    return json as T;
  } catch (e) {
    // TODO: 오류 객체에 대해 확인 하여 내부 정의한 오류를 발생시켜야한다.
    if (e instanceof Error) {
      throw new ApiError(0, e.message);
    }

    throw new ApiError(0, `공통 오류 확인 필요 ${e}`);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
