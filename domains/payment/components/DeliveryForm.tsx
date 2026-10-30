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
  onEntranceInstructionsChange: (value: string) => void;
};

export default function DeliveryForm({
  infos,
  errors,
  onRecipientNameChange,
  onRecipientPhoneChange,
  onAddressSelect,
  onAddressDetailChange,
  onEntranceInstructionsChange,
}: DeliveryFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-10">
      <section aria-labelledby="recipient-title">
        <h2
          id="recipient-title"
          className="mb-6 border-b border-current/15 pb-3 text-2xl font-bold"
        >
          Recipient details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="recipientName"
            label="Recipient name"
            name="recipientName"
            placeholder="e.g. Alex (up to 10 characters)"
            maxLength={10}
            required
            value={infos.recipientName}
            onChange={(event) => onRecipientNameChange(event.target.value)}
            error={errors.recipientName}
          />

          <FormField
            id="recipientPhone"
            label="Mobile number"
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
          Delivery address
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="w-40 min-w-0">
              <FormField
                id="postalCode"
                label="Postal code"
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
            label="Street address"
            name="recipientAddress"
            value={infos.recipientAddress}
            placeholder="Search for your address."
            readOnly
            required
            error={errors.recipientAddress}
          />

          <FormField
            id="recipientAddressDetail"
            label="Apartment or unit"
            name="recipientAddressDetail"
            value={infos.recipientAddressDetail}
            placeholder="Enter your apartment or unit number."
            onChange={(event) => onAddressDetailChange(event.target.value)}
            error={errors.recipientAddressDetail}
          />

          <FormField
            id="entranceInstructions"
            label="Building entry instructions"
            name="entranceInstructions"
            placeholder="e.g. Call guard (max. 15)"
            maxLength={15}
            value={infos.entranceInstructions}
            onChange={(event) =>
              onEntranceInstructionsChange(event.target.value)
            }
            description="Use up to 15 characters."
            error={errors.entranceInstructions}
          />
        </div>
      </section>
    </div>
  );
}
