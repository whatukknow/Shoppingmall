// 선택한 팟과 상품 목록
import Image from 'next/image';
import { FaCaretUp } from 'react-icons/fa';

import type { PaymentOrderItem } from '../data/payment.types';

type PaymentOrderItemsProps = {
  items: PaymentOrderItem[];
};

export default function PaymentOrderItems({ items }: PaymentOrderItemsProps) {
  return (
    <section aria-labelledby="order-items-title">
      <h2
        id="order-items-title"
        className="mb-6 border-b border-current/15 pb-3 text-2xl font-bold"
      >
        선택한 소분 팟의 주문 상품
      </h2>

      <details className="group rounded-xl border border-current/15">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="block font-bold">선택한 팟 {items.length}개</span>

            <span className="mt-1 block text-sm">
              {items[0].productName}
              {items.length > 1 && ` 외 ${items.length - 1}개`}
            </span>
          </span>

          <span className="sr-only group-open:hidden">상품 목록 펼치기</span>
          <span className="sr-only hidden group-open:inline">
            상품 목록 접기
          </span>

          <FaCaretUp
            aria-hidden="true"
            className="shrink-0 rotate-180 transition-transform duration-200 group-open:rotate-0"
          />
        </summary>

        <ul className="divide-y divide-current/10 border-t border-current/15 px-4">
          {items.map((item) => (
            <li key={item.podId} className="flex items-center gap-3 py-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs">
                    이미지
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="mt-1 text-sm">
                  {item.optionLabel} / 수량 {item.quantity}개
                </p>
                <p className="mt-2 font-bold">
                  {(item.unitPrice * item.quantity).toLocaleString('ko-KR')}원
                </p>
              </div>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
