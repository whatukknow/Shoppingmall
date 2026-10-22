import { apiClient } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import { HOME_LIST_LIMIT } from '@/domains/home/home.types';

/** 홈 인기 소분팟 목록 항목입니다. */
export type PodSummary = {
  id: string;
  productName: string;
  imageUrl: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
};

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
