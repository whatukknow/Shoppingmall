import PaymentPage from '@/domains/payment/components/PaymentPage';
import { getPaymentItems } from '@/domains/payment/payment.api';

export default async function Page() {
  const items = await getPaymentItems();
  return <PaymentPage items={items} />;
}
