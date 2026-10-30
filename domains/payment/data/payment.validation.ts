import type { DeliveryInfos, DeliveryErrors } from './payment.types';

export function validateDelivery(infos: DeliveryInfos): DeliveryErrors {
  const errors: DeliveryErrors = {};
  const name = infos.recipientName.trim();

  //받는 분 'Name' 검사
  if (!name) {
    errors.recipientName = 'Enter the recipient’s name.';
  } else if (name.length > 10) {
    errors.recipientName = 'Use up to 10 characters.';
  }

  // 받는 분 '전화번호' 검사
  const mobile = infos.recipientPhone;

  if (!mobile) {
    errors.recipientPhone = 'Enter a valid Korean mobile number.';
  } else if (!/^010\d{8}$/.test(mobile)) {
    errors.recipientPhone =
      'Enter an 11-digit Korean mobile number starting with 010.';
  }

  // 받는 분 '수령 주소' 검사
  if (!infos.postalCode || !infos.recipientAddress.trim()) {
    errors.recipientAddress =
      'Use address search to select a delivery address.';
  }

  // 받는 분 'Building entry instructions' 검사
  if (infos.entranceInstructions.length > 15) {
    errors.entranceInstructions =
      'Use up to 15 characters for building entry instructions.';
  }

  return errors;
}
