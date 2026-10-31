import type { OrderRecord, PendingOrderResult } from './payment.order-store';
import { hasMatchingModernTossKeys } from '../pg-toss/toss.configuration';

type CheckoutOrder = Omit<OrderRecord, 'amount'> & {
  items: NonNullable<OrderRecord['items']>;
  shippingFee: number;
};

/** Validate before invoking the injected order RPC adapter. */
export async function createVerifiedPendingOrder(
  order: CheckoutOrder,
  keys: { clientKey: string | undefined; secretKey: string | undefined },
  insert: (order: OrderRecord) => Promise<PendingOrderResult>,
): Promise<PendingOrderResult> {
  if (!hasMatchingModernTossKeys(keys.clientKey, keys.secretKey)) {
    throw new Error('Payment is unavailable. Please contact customer support.');
  }
  if (
    order.items.length === 0 ||
    !Number.isSafeInteger(order.shippingFee) ||
    order.shippingFee < 0 ||
    order.items.some(
      (item) =>
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isSafeInteger(item.unitPrice) ||
        item.unitPrice <= 0,
    )
  ) {
    throw new Error('Could not verify the order total.');
  }
  const amount = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    order.shippingFee,
  );
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Could not verify the order total.');
  }
  return insert({ ...order, amount });
}
