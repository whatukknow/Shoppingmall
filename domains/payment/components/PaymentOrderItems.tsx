import { foodLabel } from '@/shared/lib/food-label';
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
        Items in your shared order
      </h2>

      <details className="group rounded-xl border border-current/15">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="block font-bold">
              {items.length} groups selected
            </span>

            <span className="mt-1 block text-sm">
              {items[0].productName}
              {items.length > 1 && ` and ${items.length - 1} more`}
            </span>
          </span>

          <span className="sr-only group-open:hidden">Expand items</span>
          <span className="sr-only hidden group-open:inline">
            Collapse items
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
                    alt={foodLabel(item.productName)}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs">
                    Image
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{foodLabel(item.productName)}</p>
                <p className="mt-1 text-sm">
                  {foodLabel(item.optionLabel)} / Qty {item.quantity}
                </p>
                <p className="mt-2 font-bold">
                  {(item.unitPrice * item.quantity).toLocaleString('en-US')} KRW
                </p>
              </div>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
