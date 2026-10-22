import { apiClient } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import type {
  MyPayment,
  MyPodApplication,
  TasteProfile,
  TasteProfileRequest,
  User,
} from './users.types';

// 회원 정보 조회
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('users/me');
  return response.data;
}

// 취향 프로필 저장 (camelCase 화면 타입을 snake_case 본문으로 바꿔 보낸다)
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
export async function saveTasteProfile(
  profile: TasteProfile,
): Promise<TasteProfile> {
  const response = await apiClient.put<ApiResponse<TasteProfile>>(
    'users/me/taste-profile',
    toTasteProfileRequest(profile),
  );
  return response.data;
}

// 취향 프로필 조회
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
export async function getTasteProfile(): Promise<TasteProfile> {
  const response = await apiClient.get<ApiResponse<TasteProfile>>(
    'users/me/taste-profile',
  );
  return response.data;
}

// 내 소분 팟 신청 내역 조회
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
export async function getMyPodApplications({
  status = 'all',
  sort = 'latest',
  limit = 0,
  offset = 0,
} = {}): Promise<ListResponse<MyPodApplication>> {
  const response = await apiClient.get<
    ApiResponse<ListResponse<MyPodApplication>>
  >('users/me/pod-applications', {
    params: { status, sort, limit, offset },
  });
  return response.data;
}

// 내 결제 내역 조회
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
export async function getMyPayments({
  status,
  limit = 20,
  offset = 0,
}: {
  status?: MyPayment['status'];
  limit?: number;
  offset?: number;
} = {}): Promise<ListResponse<MyPayment>> {
  const params: {
    status?: string;
    limit: number;
    offset: number;
  } = {
    limit,
    offset,
  };
  if (status) params.status = status;

  const response = await apiClient.get<ApiResponse<ListResponse<MyPayment>>>(
    'users/me/payments',
    { params },
  );
  return response.data;
}

// camelCase 취향 프로필을 API 요청 본문(snake_case)으로 변환한다
export function toTasteProfileRequest(
  profile: TasteProfile,
): TasteProfileRequest {
  return {
    source: profile.source,
    variant: profile.variant,
    nickname: profile.nickname,
    birth_year: profile.birthYear,
    birth_md: profile.birthMd,
    gender: profile.gender,
    animal: profile.animal,
    element: profile.element,
    sunday: profile.sunday,
    fridge: profile.fridge,
    items: profile.items,
    kit: profile.kit,
    consent: profile.consent,
    quality_flags: profile.qualityFlags,
  };
}
