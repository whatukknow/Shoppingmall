// 내 신청 정보와 행동
// 내가 선택한 옵션,수량,예상금액, 신청 취소와 결제까지.
import Image from 'next/image';
import { Button } from '@/shared/components';

type PodApplicationSummaryProps = {
  productName: string;
  optionLabel: string;
  quantity: number;
  unitPrice: number;
  status: 'recruiting' | 'matched';
  onPayment: () => void;
};

export default function PodApplicationsSummary({
  productName,
  optionLabel,
  quantity,
  unitPrice,
  status,
  onPayment,
}: PodApplicationSummaryProps) {
  const totalPrice = unitPrice * quantity;
  const isMatched = status === 'matched';

  return (
    <div className="rounded-2xl border border-current/15 bg-white/30 p-5 sm:p-6">
      {/* 내가 신청한 상품 */}
      <div>
        <h3 className="text-lg font-bold">{productName}</h3>
        <p className="mt-1 text-sm">{optionLabel}</p>
      </div>

      {/* 수량과 금액 */}
      <dl className="mt-6 space-y-3">
        <div className="flex justify-between gap-4">
          <dt>신청 수량</dt>
          <dd>{quantity}개</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>예상 상품 금액</dt>
          <dd className="font-bold">{totalPrice.toLocaleString('ko-KR')}원</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs">
        배송비를 포함한 최종 금액은 결제 화면에서 확인해 주세요.
      </p>

      {/* 모집 상태별 안내 */}
      <div className="mt-6 border-t border-current/15 pt-4">
        <p id="pod-payment-guide" className="mb-3 text-sm">
          {isMatched ? '모집 완료! 결제해 주세요.' : '모집 완료 후 결제 가능'}
        </p>

        <Button
          type="button"
          size="touch"
          disabled={!isMatched}
          onClick={onPayment}
          aria-describedby="pod-payment-guide"
          className="w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          결제하러 가기
        </Button>

        <p className="mt-4 text-xs leading-5">
          함께 나누는 주문인 만큼 신중하게 신청해 주세요. 결제 24시간 이후에는
          주문 진행 상태에 따라 단순변심 취소가 제한될 수 있습니다. 상품
          하자·오배송은 별도 기준으로 처리됩니다.
        </p>
      </div>
    </div>
  );
}
