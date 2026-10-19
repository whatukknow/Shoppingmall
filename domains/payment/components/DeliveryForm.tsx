// 배송 정보 입력 (선택이 바뀌면 부모에게 알려주는 컴포넌트임)
import { FormField } from '@/shared/components';
import { formatPhoneNumber } from '@/domains/payment/data/payment.utils';
import AddressSearchButton from './AddressSearchButton';

import type {
  DeliveryInfos,
  DeliveryErrors,
} from '@/domains/payment/data/payment.types';

type DeliveryFormProps = {
  infos: DeliveryInfos;
  errors: DeliveryErrors;
  onRecipientNameChange: (value: string) => void;
  onRecipientPhoneChange: (value: string) => void;
  onAddressSelect: (postalCode: string, address: string) => void;
  onAddressDetailChange: (value: string) => void;
  onSaveAsDefaultAddressChange: (checked: boolean) => void;
  onEntranceInstructionsChange: (value: string) => void;
};

export default function DeliveryForm({
  infos,
  errors,
  onRecipientNameChange,
  onRecipientPhoneChange,
  onAddressSelect,
  onAddressDetailChange,
  onSaveAsDefaultAddressChange,
  onEntranceInstructionsChange,
}: DeliveryFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-10">
      <section aria-labelledby="recipient-title">
        <h2
          id="recipient-title"
          className="mb-6 border-b border-current/15 pb-3 text-2xl font-bold"
        >
          받으실 분 정보
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            name="recipientPhone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-0000-0000"
            maxLength={13}
            required
            value={formatPhoneNumber(infos.recipientPhone)}
            onChange={(event) => onRecipientPhoneChange(event.target.value)}
            error={errors.recipientPhone}
          />
        </div>
      </section>

      <section aria-labelledby="delivery-title">
        <h2
          id="delivery-title"
          className="mb-6 border-b border-current/15 pb-3 text-2xl font-bold"
        >
          배송지 정보
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="w-40 min-w-0">
              <FormField
                id="postalCode"
                label="우편번호"
                name="postalCode"
                value={infos.postalCode}
                readOnly
              />
            </div>

            <div className="shrink-0">
              <AddressSearchButton onSelect={onAddressSelect} />
            </div>
          </div>

          <FormField
            id="recipientAddress"
            label="기본 주소"
            name="recipientAddress"
            value={infos.recipientAddress}
            placeholder="주소를 검색하세요."
            readOnly
            required
            error={errors.recipientAddress}
          />

          <FormField
            id="recipientAddressDetail"
            label="상세 주소"
            name="recipientAddressDetail"
            value={infos.recipientAddressDetail}
            placeholder="호수 등 상세 주소를 입력해주세요."
            onChange={(event) => onAddressDetailChange(event.target.value)}
            error={errors.recipientAddressDetail}
          />

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="saveAsDefaultAddress"
              checked={infos.saveAsDefaultAddress}
              onChange={(event) =>
                onSaveAsDefaultAddressChange(event.target.checked)
              }
            />
            <span>이 주소를 기본 배송지로 저장하기</span>
          </label>

          <FormField
            id="entranceInstructions"
            label="공동현관 출입 방법"
            name="entranceInstructions"
            placeholder="예) 경비실 호출 (최대 15자)"
            maxLength={15}
            value={infos.entranceInstructions}
            onChange={(event) =>
              onEntranceInstructionsChange(event.target.value)
            }
            description="15자 이내로 입력해 주세요."
            error={errors.entranceInstructions}
          />
        </div>
      </section>
    </div>
  );
}
