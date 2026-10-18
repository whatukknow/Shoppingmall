// 배송 정보 입력
import { FormField } from '@/shared/components';
import { formatPhoneNumber } from '@/domains/payment/data/payment.utils';

import type {
  DeliveryInfos,
  DeliveryErrors,
} from '@/domains/payment/data/payment.types';

type DeliveryFormProps = {
  infos: DeliveryInfos;
  errors: DeliveryErrors;
  onRecipientNameChange: (value: string) => void;
  onRecipientPhoneChange: (value: string) => void;
};

export default function DeliveryForm({
  infos,
  errors,
  onRecipientNameChange,
  onRecipientPhoneChange,
}: DeliveryFormProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">배송 정보</h2>

      <FormField
        id="recipientName"
        label="받으실 분"
        name="recipientName"
        placeholder="예) 김포션 (최대 10자)"
        maxLength={10}
        required
        value={infos.recipientName}
        onChange={(event) => onRecipientNameChange(event.target.value)}
        error={errors.recipientName}
      />

      <FormField
        id="recipientPhone"
        label="휴대폰 번호"
        name="mobile"
        placeholder="010-0000-0000"
        maxLength={15}
        required
        value={formatPhoneNumber(infos.recipientPhone)}
        onChange={(event) => onRecipientPhoneChange(event.target.value)}
        error={errors.recipientPhone}
      />
    </section>
  );
}
