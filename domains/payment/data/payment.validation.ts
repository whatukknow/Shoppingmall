import type { DeliveryInfos, DeliveryErrors } from './payment.types';

export function validateDelivery(infos: DeliveryInfos): DeliveryErrors {
  const errors: DeliveryErrors = {};
  const name = infos.recipientName.trim();

  //받는 분 '이름' 검사
  if (!name) {
    errors.recipientName = '받으실 분을 입력해 주세요.';
  } else if (name.length > 10) {
    errors.recipientName = '10자 이내로 입력해 주세요.';
  }

  // 받는 분 '전화번호' 검사
  const mobile= infos.recipientPhone;

  if (!mobile) {
    errors.recipientPhone = '올바른 휴대전화 번호를 입력해 주세요.'
  } else if (!/^010\d{8}$/.test(mobile)) {
    errors.recipientPhone = '010으로 시작하는 번호 11자리 숫자를 입력해 주세요.'
  }

  return errors;
}
