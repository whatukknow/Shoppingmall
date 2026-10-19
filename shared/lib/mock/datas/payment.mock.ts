import { paymentMockItems } from '@/domains/payment/data/payment.mock';

export const paymentData: Record<`GET ${string}`, string> = {
  'GET payment/items': JSON.stringify(paymentMockItems),
};
