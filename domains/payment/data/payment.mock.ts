import type { PaymentOrderItem } from './payment.types';

//나중에는 유저가 선택한 결제 가능한 팟만 서버에서 받아서 데이터 불러올 수 있도록 설계하기!
export const paymentMockItems: PaymentOrderItem[] = [
  {
    podId: 'pod-1',
    productName: '용인 블루베리',
    optionLabel: '1팩 · 125g',
    quantity: 1,
    unitPrice: 4900,
    imageUrl: '/uploads/images/home/products/illustration-blueberries.png',
  },
  {
    podId: 'pod-2',
    productName: '시흥 스테비아 토마토',
    optionLabel: '1팩 · 500g',
    quantity: 1,
    unitPrice: 7900,
    imageUrl: '/uploads/images/home/products/tomatoes.png',
  },
];
