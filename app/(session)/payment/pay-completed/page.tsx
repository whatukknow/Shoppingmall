import { redirect } from 'next/navigation';
import PaymentResultPage from '@/domains/payment/components/PaymentResultPage';
import { confirmPaymentAction } from '@/domains/payment/payment.actions';
import { findOrder } from '@/domains/payment/data/payment.order-store';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const { paymentKey, orderId, amount } = query;
  if (
    typeof paymentKey !== 'string' ||
    !paymentKey ||
    typeof orderId !== 'string' ||
    !orderId ||
    typeof amount !== 'string' ||
    !/^\d+$/.test(amount)
  ) {
    return (
      <PaymentResultPage
        status="recovery"
        items={[]}
        orderItems={[]}
        recoveryMessage="Payment details are missing. Check your order status or contact customer support before making another payment."
      />
    );
  }
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) {
    return (
      <PaymentResultPage
        status="recovery"
        items={[]}
        orderItems={[]}
        recoveryMessage="The payment amount could not be verified. Contact customer support before making another payment."
      />
    );
  }
  const recoveryHref = `/payment/pay-completed?${new URLSearchParams({
    paymentKey,
    orderId,
    amount,
    recovery: '1',
  }).toString()}`;
  const result = await confirmPaymentAction(
    { paymentKey, orderId, amount: value },
    undefined,
    { reconcileOnly: query.recovery === '1' },
  );
  if (!result.success && !result.recoveryRequired) {
    const failure = new URLSearchParams({
      code: result.code,
      message: result.message,
      orderId,
    });
    redirect(`/payment/pay-failed?${failure.toString()}`);
  }
  const order = await findOrder(orderId).catch(() => null);
  if (
    !result.success ||
    !order ||
    order.status !== 'PAID' ||
    !order.items?.length
  ) {
    return (
      <PaymentResultPage
        status="recovery"
        items={order?.items ?? []}
        orderItems={order?.items ?? []}
        paidAmount={order?.amount}
        orderShippingFee={order?.shippingFee}
        recoveryMessage={
          !result.success
            ? result.message
            : 'The payment was approved, but your order details could not be loaded. Check this payment again or contact customer support. Do not make another payment.'
        }
        recoveryHref={recoveryHref}
      />
    );
  }
  return (
    <PaymentResultPage
      status="success"
      items={order.items}
      orderItems={order.items}
      receiptUrl={result.receiptUrl}
      paidAmount={order.amount}
      orderShippingFee={order.shippingFee}
    />
  );
}
