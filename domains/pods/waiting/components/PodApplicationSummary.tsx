import { foodLabel } from '@/shared/lib/food-label';
// 내 신청 정보와 행동
// 내가 선택한 팟 목록과 합계, 결제까지.
import { Button } from '@/shared/components';

import type { MyPodApplication } from '@/domains/auth/users.types';

type PodApplicationSummaryProps = {
  items: MyPodApplication[];
  totalPrice: number;
  onPayment: () => void;
};

export default function PodApplicationsSummary({
  items,
  totalPrice,
  onPayment,
}: PodApplicationSummaryProps) {
  const hasSelection = items.length > 0;

  return (
    <div className="rounded-2xl border border-current/15 bg-white/30 p-5 sm:p-6">
      {/* 선택한 신청 목록 */}
      {hasSelection && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.podId}>
              <p className="text-lg font-bold">
                {foodLabel(item.productName)} · {foodLabel(item.optionLabel)} ·{' '}
                {item.quantity} items
              </p>
              <p className="mt-1 text-sm">
                {(item.quantity * item.unitPrice).toLocaleString('en-US')} KRW
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* 금액 */}
      <dl className="mt-6 space-y-3">
        <div className="flex justify-between gap-4">
          <dt>Estimated subtotal</dt>
          <dd className="font-bold">
            {totalPrice.toLocaleString('en-US')} KRW
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs">
        Check the final total, including delivery, at checkout.
      </p>

      {/* 결제 안내 */}
      <div className="mt-6 border-t border-current/15 pt-4">
        <p id="pod-payment-guide" className="mb-3 text-sm">
          Your group is full! You can now pay.
        </p>

        <Button
          type="button"
          size="touch"
          disabled={!hasSelection}
          onClick={onPayment}
          aria-describedby="pod-payment-guide"
          className="w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pay now
        </Button>

        <p className="mt-4 text-xs leading-5">
          Please join thoughtfully, as this is a shared order. After 24 hours
          from payment, cancellations for a change of mind may be restricted
          depending on order progress. Defective items and delivery errors are
          handled separately.
        </p>
      </div>
    </div>
  );
}
