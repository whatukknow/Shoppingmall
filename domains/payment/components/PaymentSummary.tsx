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
        Order summary
      </h2>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{subtotal.toLocaleString('en-US')} KRW</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>Delivery fee</dt>
          <dd>{shippingFee.toLocaleString('en-US')} KRW</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>Discount</dt>
          <dd>-{discount.toLocaleString('en-US')} KRW</dd>
        </div>

        <div className="flex justify-between gap-4 border-t border-current/15 pt-4 text-lg font-bold">
          <dt>Total</dt>
          <dd>{total.toLocaleString('en-US')} KRW</dd>
        </div>
      </dl>

      <div className="my-6 border-t border-current/15 pt-5">
        <label className="flex cursor-pointer items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(event) => onPrivacyConsentChange(event.target.checked)}
          />
          <span>Agree to all</span>
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
          <span>
            I consent to the collection and use of personal information
            (required)
          </span>
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
          ? 'Preparing checkout…'
          : `Pay ${total.toLocaleString('en-US')} KRW`}
      </Button>

      <p className="mt-3 text-xs">
        Continue to Toss Payments to complete your purchase.
      </p>
    </section>
  );
}
