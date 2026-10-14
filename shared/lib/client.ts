import fetchMockup from './mockup/mockup_server';

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

    const data = fetchMockup(method, buildUrl(path, params), jsonBody);

    return data as T;
  } catch (e) {
    // TODO: 오류 객체에 대해 확인 하여 내부 정의한 오류를 발생시켜야한다.
    if (e instanceof Error) {
      throw new ApiError(0, e.message);
    }

    throw new ApiError(0, `공통 오류 확인 필요 ${e}`);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string) => request<T>('POST', path),
  put: <T>(path: string) => request<T>('PUT', path),
  patch: <T>(path: string) => request<T>('PATCH', path),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
