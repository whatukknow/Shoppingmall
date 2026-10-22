import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  encodeTossBasicAuth,
  formatOrderName,
  verifyOrderBeforeConfirm,
} from '@/domains/payment/pg-toss/toss.service';

const pendingOrder = {
  orderId: 'ORD-1761100000000-abc123',
  status: 'PENDING' as const,
  amount: 15800,
};

const callback = {
  paymentKey: 'tgen_test_key',
  orderId: 'ORD-1761100000000-abc123',
  amount: 15800,
};

describe('toss.service', () => {
  it('시크릿 키 뒤에 콜론을 붙여 Base64 Basic Auth 헤더를 만든다', () => {
    const expected = Buffer.from('test_sk_12345:').toString('base64');
    assert.equal(encodeTossBasicAuth('test_sk_12345'), `Basic ${expected}`);
  });

  it('주문명: 1개면 상품명, 여러 개면 "외 N건"', () => {
    assert.equal(formatOrderName(['용인 블루베리']), '용인 블루베리');
    assert.equal(
      formatOrderName(['용인 블루베리', '시흥 스테비아 토마토']),
      '용인 블루베리 외 1건',
    );
    assert.equal(formatOrderName([]), '주문 상품');
  });

  it('주문 금액과 콜백 금액이 같으면 통과한다', () => {
    assert.deepEqual(verifyOrderBeforeConfirm(pendingOrder, callback), {
      valid: true,
      alreadyPaid: false,
    });
  });

  it('콜백 금액이 조작되면 차단한다', () => {
    const result = verifyOrderBeforeConfirm(pendingOrder, { ...callback, amount: 100 });
    assert.equal(result.valid, false);
    assert.equal(result.valid === false && result.code, 'AMOUNT_MISMATCH');
  });

  it('이미 PAID인 같은 결제는 alreadyPaid로 통과한다 (새로고침)', () => {
    const paid = { ...pendingOrder, status: 'PAID' as const, paymentKey: 'tgen_test_key' };
    assert.deepEqual(verifyOrderBeforeConfirm(paid, callback), {
      valid: true,
      alreadyPaid: true,
    });
  });

  it('이미 PAID인데 다른 paymentKey면 차단한다', () => {
    const paid = { ...pendingOrder, status: 'PAID' as const, paymentKey: 'other_key' };
    const result = verifyOrderBeforeConfirm(paid, callback);
    assert.equal(result.valid === false && result.code, 'PAYMENT_MISMATCH');
  });
});
