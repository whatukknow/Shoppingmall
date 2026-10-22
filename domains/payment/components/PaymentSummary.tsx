// 함계 금액 및 동의, 결제 버튼
import { Button } from '@/shared/components';

type PaymentSummmaryProps = {
  subtotal: number;
  shippingFee: number;
  discount: number;
  privacyConsent: boolean;
  onPrivacyConsentChange: (checked: boolean) => void;
  privacyError?: string;
  hasItems: boolean;
  isPaying?: boolean;
};

export default function PaymentSummary({
  subtotal,
  shippingFee,
  discount,
  privacyConsent,
  onPrivacyConsentChange,
  privacyError,
  hasItems,
  isPaying = false,
}: PaymentSummmaryProps) {
  const total = subtotal + shippingFee - discount;

  return (
    <section
      aria-labelledby="payment-summary-title"
      className="rounded-xl border border-current/15 bg-white/40 p-5"
    >
      <h2 id="payment-summary-title" className="text-2xl font-bold">
        결제 요약
      </h2>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt>상품 금액</dt>
          <dd>{subtotal.toLocaleString('ko-KR')}원</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>배송비</dt>
          <dd>{shippingFee.toLocaleString('ko-KR')}원</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>할인 금액</dt>
          <dd>-{discount.toLocaleString('ko-KR')}원</dd>
        </div>

        <div className="flex justify-between gap-4 border-t border-current/15 pt-4 text-lg font-bold">
          <dt>총 결제 금액</dt>
          <dd>{total.toLocaleString('ko-KR')}원</dd>
        </div>
      </dl>

      <div className="my-6 border-t border-current/15 pt-5">
        <label className="flex cursor-pointer items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(event) => onPrivacyConsentChange(event.target.checked)}
          />
          <span>전체 동의</span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm">
          <input
            id="privacyConsent"
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(event) => onPrivacyConsentChange(event.target.checked)}
            aria-describedby={privacyError ? 'privacyConsent-error' : undefined}
            className="mt-1"
          />
          <span>개인정보 수집·이용 동의 (필수)</span>
        </label>

        {privacyError && (
          <p
            id="privacyConsent-error"
            role="alert"
            className="mt-2 text-sm text-red-600"
          >
            {privacyError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="touch"
        disabled={!hasItems || isPaying}
        aria-busy={isPaying}
        className="w-full"
      >
        {isPaying
          ? '결제창을 준비하고 있습니다…'
          : `${total.toLocaleString('ko-KR')}원 결제하기`}
      </Button>

      <p className="mt-3 text-xs">
        결제하기를 누르면 토스 결제창으로 연결됩니다.
      </p>
    </section>
  );
}
