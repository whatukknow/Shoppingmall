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
  productName: string;
  imageUrl: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
};
