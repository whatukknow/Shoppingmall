import { apiClient } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import { HOME_LIST_LIMIT } from '@/domains/home/home.constants';
import { POD_LIST_LIMIT } from './pods.constants';
import type {
  Pod,
  PodCreateRequest,
  PodSort,
  PodStatusFilter,
  PodSummary,
} from './pods.types';

/** 베스트 소분팟 목록을 조회합니다. */
export async function getPods({
  status = 'open',
  sort = 'best',
  limit = HOME_LIST_LIMIT.popularPods,
}: {
  status?: 'open' | 'close';
  sort?: 'best' | 'asc' | 'desc';
  limit?: number;
} = {}): Promise<PodSummary[]> {
  const response = await apiClient.get<ApiResponse<ListResponse<PodSummary>>>(
    'pods',
    { params: { status, sort, limit } },
  );
  return response.data.list;
}

/** 상품별 소분팟 목록을 조회합니다. status 기본 all, sort 는 항상 마감 임박순입니다. */
export async function getProductPods(
  productId: string,
  {
    status = 'all',
    sort = 'deadline',
    limit = POD_LIST_LIMIT,
    offset = 0,
  }: {
    status?: PodStatusFilter;
    sort?: PodSort;
    limit?: number;
    offset?: number;
  } = {},
): Promise<ListResponse<Pod>> {
  const response = await apiClient.get<ApiResponse<ListResponse<Pod>>>(
    `products/${encodeURIComponent(productId)}/pods`,
    { params: { status, sort, limit, offset } },
  );
  return response.data;
}

/** 상품에 새 소분팟을 생성합니다. */
// TODO(session): 로그인 사용자 기준 — 세션 도입 시 인증 확인
export async function createPod(
  productId: string,
  body: PodCreateRequest,
): Promise<Pod> {
  const response = await apiClient.post<ApiResponse<Pod>>(
    `products/${encodeURIComponent(productId)}/pods`,
    body,
  );
  return response.data;
}

/** 소분팟 참여를 신청합니다. */
// TODO(session): 로그인 사용자 기준 — 세션 도입 시 인증 확인
export async function applyPod(podId: string): Promise<Pod> {
  const response = await apiClient.post<ApiResponse<Pod>>(
    `pods/${encodeURIComponent(podId)}/applications`,
  );
  return response.data;
}

/** 소분팟 참여 신청을 취소합니다. */
// TODO(session): 로그인 사용자 기준 — 세션 도입 시 인증 확인
export async function cancelPodApplication(podId: string): Promise<Pod> {
  const response = await apiClient.delete<ApiResponse<Pod>>(
    `pods/${encodeURIComponent(podId)}/applications/me`,
  );
  return response.data;
}
