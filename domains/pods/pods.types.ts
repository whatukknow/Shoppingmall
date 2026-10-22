/** 현재 화면에서 사용하는 모집 상태입니다. DB 상태와의 변환은 API 연결 시 처리합니다. */
export type PodRecruitmentStatus = 'recruiting' | 'matched';

export type PodApplicationStatus =
  'recruiting' | 'payment-ready' | 'paid' | 'cancelled';

export type PodIdentity = {
  productId: string;
};

export type PodListItem = {
  potId: string;
  title: string;
  state: string;
  imageURL: string;
};

export type PodRecruitment = {
  productName: string;
  imageUrl: string;
  optionLabel: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
  status: PodRecruitmentStatus;
};

export type PodApplication = {
  productName: string;
  optionLabel: string;
  quantity: number;
  unitPrice: number;
  status: PodRecruitmentStatus;
};

/** 입력 중에는 빈 값도 허용하므로 문자열로 보관합니다. */
export type PodCreateValues = {
  targetCount: string;
  deadline: string;
};

export type LivePod = {
  id: string;
  title: string;
  cropName: string;
  description?: string;
  status: PodApplicationStatus;
  applicantCount: number;
  capacity: number;
};

/** 홈 인기 소분팟 목록 항목입니다. */
export type PodSummary = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
};

/** 상품별 소분팟 모집 상태입니다. */
export type PodStatus = 'open' | 'close';

/** 상품별 소분팟 단일 항목입니다. */
export type Pod = {
  id: string;
  productName: string;
  imageUrl: string;
  optionLabel: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
  status: PodStatus;
};

/** 상품별 팟 목록 조회 시 status 필터입니다. */
export type PodStatusFilter = 'all' | 'open' | 'close';

/** 상품별 팟 목록 조회 정렬 기준입니다. deadline 은 마감 임박순입니다. */
export type PodSort = 'deadline' | 'asc' | 'desc';

/** 새 팟 생성 요청 본문입니다. deadline 은 YYYY-MM-DD 형식입니다. */
export type PodCreateRequest = {
  targetCount: number;
  deadline: string;
};
