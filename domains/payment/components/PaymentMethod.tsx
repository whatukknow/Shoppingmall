// 결제 수단 및 조건별 안내 (선택이 바뀌면 부모에게 알려주는 컴포넌트임)

import type {
  PaymentMethods,
  PaymentErrors,
} from '@/domains/payment/data/payment.types';

type PaymentMethodProps = {
  value: PaymentMethods;
  error: PaymentErrors['paymentMethod'];
  onChange: (value: PaymentMethods) => void;
};

export default function PaymentMethod({
  value,
  error,
  onChange,
}: PaymentMethodProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-xl font-bold">결제 수단</legend>
      <label className="flex items-center gap-2">
        <input
          id="paymentMethod-card"
          type="ratio"
          name="paymentMethod"
          value="card"
          checked={value === 'card'}
          onChange={() => onChange('card')}
          aria-describedby={error ? 'paymentMethod-error' : undefined}
        />
        <span>신용카드</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          id="paymentMethod-naverpay"
          type="ratio"
          name="paymentMethod"
          value="naverpay"
          checked={value === 'naverpay'}
          onChange={() => onChange('naverpay')}
          aria-describedby={error ? 'paymentMethod-error' : undefined}
        />
        <span>네이버페이</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          id="paymentMethod-kakaopay"
          type="ratio"
          name="paymentMethod"
          value="kakaopay"
          checked={value === 'kakaopay'}
          onChange={() => onChange('kakaopay')}
          aria-describedby={error ? 'paymentMethod-error' : undefined}
        />
        <span>카카오페이</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          id="paymentMethod-tosspay"
          type="ratio"
          name="paymentMethod"
          value="tosspay"
          checked={value === 'tosspay'}
          onChange={() => onChange('tosspay')}
          aria-describedby={error ? 'paymentMethod-error' : undefined}
        />
        <span>토스페이</span>
      </label>

      {error && <p>{error}</p>}
    </fieldset>
  );
}
