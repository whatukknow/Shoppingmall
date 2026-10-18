// 배송정보
// 배송 정보
export type DeliveryInfos = {
  recipientName: string; // 받으실 분
  recipientPhone: string; // 휴대폰 번호
  postalCode: string; // 우편번호
  recipientAddress: string; // 주소 검색으로 선택한 기본 주소
  recipientAddressDetail: string; // 상세주소
  saveAsDefaultAddress: boolean; // 기본 배송지 저장 여부
  entranceInstructions: string; // 공동현관 출입 방법
  deliveryRequest: string; // 배송 요청사항
};

// 입력 항목별 오류 메시지
export type DeliveryErrors = {
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientAddressDetail?: string;
  entranceInstructions?: string;
  deliveryRequest?: string;
};
