import PaymentResultPage from '@/domains/payment/components/PaymentResultPage';
import { getPaymentItems } from '@/domains/payment/payment.api';

export default async function Page() {
  const items = await getPaymentItems();
  return <PaymentResultPage status="success" items={items} />;
}
