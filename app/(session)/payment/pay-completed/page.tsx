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
    redirect('/payment');
  }
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) redirect('/payment');

  const result = await confirmPaymentAction({
    paymentKey,
    orderId,
    amount: value,
  });
  if (!result.success) {
    const failure = new URLSearchParams({
      code: result.code,
      message: result.message,
      orderId,
    });
    redirect(`/payment/pay-failed?${failure.toString()}`);
  }
  const order = await findOrder(orderId);
  if (!order || order.status !== 'PAID' || !order.items) redirect('/payment');
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
