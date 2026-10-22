/** 공통 API 응답 래퍼입니다. */
export type ApiResponse<T> = { data: T };

/** 목록 조회 공통 응답 본문입니다. 요청 limit 0 = 전체 */
export type ListResponse<T> = {
  list: T[];
  total: number;
  limit: number;
  offset: number;
};

/** 목록 전체를 의미하는 limit 값입니다. */
export const LIMIT_ALL = 0;
