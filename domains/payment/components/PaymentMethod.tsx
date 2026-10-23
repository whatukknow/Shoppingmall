// 결제 수단 및 조건별 안내 (선택이 바뀌면 부모에게 알려주는 컴포넌트임)
import Image from 'next/image';

import type {
  PaymentMethods,
  PaymentErrors,
} from '@/domains/payment/data/payment.types';

type PaymentMethodProps = {
  value: PaymentMethods;
  error: PaymentErrors['paymentMethod'];
  onChange: (value: PaymentMethods) => void;
};

type PaymentOption = {
  value: Exclude<PaymentMethods, ''>;
  label: string;
  logo: string | null;
  color: string;
};

const paymentOptions: PaymentOption[] = [
  {
    value: 'card',
    label: '신용카드',
    logo: null,
    color: 'bg-white text-[#601025]',
  },
  {
    value: 'tosspay',
    label: '토스페이',
    logo: '/images/payment/tosspay.png',
    color: 'bg-white text-[#601025]',
  },
];

export default function PaymentMethod({
  value,
  error,
  onChange,
}: PaymentMethodProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-6 w-full border-b border-current/15 pb-3 text-2xl font-bold">
        결제 수단
      </legend>

      <div className="grid grid-cols-[repeat(2,140px)] gap-3">
        {paymentOptions.map((option) => (
          <label key={option.value} className="min-w-0 cursor-pointer">
            <input
              id={`paymentMethod-${option.value}`}
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={error ? 'paymentMethod-error' : undefined}
              className="peer sr-only"
            />

            <span
              className={`payment-method-option flex h-16 items-center justify-center rounded-none border border-black/15 px-4 py-3 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 ${option.color}`}
            >
              {option.logo ? (
                <Image
                  src={option.logo}
                  alt={option.label}
                  width={360}
                  height={270}
                  className="payment-method-logo"
                />
              ) : (
                <span className="font-medium">{option.label}</span>
              )}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p
          id="paymentMethod-error"
          role="alert"
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
