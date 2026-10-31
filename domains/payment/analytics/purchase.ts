import { createHash } from 'node:crypto';
import type { OrderRecord } from '@/domains/payment/data/payment.order-store';

export type PurchaseAnalyticsPayload = {
  transactionId: string;
  currency: 'KRW';
  value: number;
  shipping: number;
  items: { item_name: string; price: number; quantity: number }[];
};

/** Only the verified, owned PAID order snapshot may become an analytics purchase. */
export function buildPurchaseAnalytics(
  orderId: string,
  order: OrderRecord | null,
): PurchaseAnalyticsPayload | null {
  if (
    !orderId ||
    orderId.length > 128 ||
    !order ||
    order.status !== 'PAID' ||
    !Number.isSafeInteger(order.amount) ||
    order.amount <= 0 ||
    !Number.isSafeInteger(order.shippingFee) ||
    (order.shippingFee ?? -1) < 0 ||
    !order.items?.length ||
    order.items.length > 200
  ) {
    return null;
  }

  let subtotal = 0;
  const items: PurchaseAnalyticsPayload['items'] = [];
  for (const item of order.items) {
    if (
      typeof item.productName !== 'string' ||
      !item.productName.trim() ||
      !Number.isSafeInteger(item.unitPrice) ||
      item.unitPrice <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return null;
    }
    const lineTotal = item.unitPrice * item.quantity;
    if (!Number.isSafeInteger(lineTotal + subtotal)) return null;
    subtotal += lineTotal;
    items.push({
      item_name: item.productName.trim().slice(0, 100),
      price: item.unitPrice,
      quantity: item.quantity,
    });
  }

  const shipping = order.shippingFee as number;
  if (subtotal + shipping !== order.amount) return null;
  return {
    transactionId: createHash('sha256')
      .update(`ga4-purchase\0${orderId}`)
      .digest('hex'),
    currency: 'KRW',
    value: subtotal,
    shipping,
    items,
  };
}
