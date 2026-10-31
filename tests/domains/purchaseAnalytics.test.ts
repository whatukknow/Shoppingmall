import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildPurchaseAnalytics } from '../../domains/payment/analytics/purchase';
import type { OrderRecord } from '../../domains/payment/data/payment.order-store';

const paid: OrderRecord = {
  status: 'PAID',
  podIds: ['synthetic-private-group'],
  amount: 4900,
  shippingFee: 3000,
  paymentKey: 'synthetic-private-payment-key',
  receiptUrl: 'https://example.invalid/private-receipt',
  items: [
    {
      podId: 'synthetic-private-group',
      productName: 'Fixture apples',
      optionLabel: '1 portion',
      quantity: 1,
      unitPrice: 1900,
      imageUrl: 'https://example.invalid/private-image',
    },
  ],
  shippingInfo: {
    recipientName: 'Synthetic recipient',
    recipientPhone: 'synthetic-private-phone',
    postalCode: 'synthetic-private-postal-code',
    recipientAddress: 'synthetic-private-address',
    recipientAddressDetail: 'synthetic-private-detail',
    entranceInstructions: 'synthetic-private-entry',
  },
};

describe('verified purchase analytics snapshot', () => {
  it('uses merchandise revenue excluding delivery and an opaque stable transaction', () => {
    const result = buildPurchaseAnalytics('synthetic-order', paid);
    assert.ok(result);
    assert.match(result.transactionId, /^[a-f0-9]{64}$/);
    assert.equal(result.value, 1900);
    assert.equal(result.shipping, 3000);
    assert.equal(result.currency, 'KRW');
    assert.deepEqual(result.items, [
      { item_name: 'Fixture apples', price: 1900, quantity: 1 },
    ]);
    assert.equal(
      result.transactionId,
      buildPurchaseAnalytics('synthetic-order', paid)?.transactionId,
    );
    assert.notEqual(
      result.transactionId,
      buildPurchaseAnalytics('another-synthetic-order', paid)?.transactionId,
    );
  });

  it('never forwards order, group, provider, receipt or delivery identifiers', () => {
    const result = buildPurchaseAnalytics('synthetic-order', paid);
    assert.ok(result);
    const encoded = JSON.stringify(result);
    for (const value of [
      'synthetic-order',
      'synthetic-private',
      'Synthetic recipient',
      'example.invalid',
      '1 portion',
    ]) {
      assert.equal(encoded.includes(value), false, value);
    }
    assert.deepEqual(Object.keys(result).sort(), [
      'currency',
      'items',
      'shipping',
      'transactionId',
      'value',
    ]);
  });

  it('rejects a missing or pending order and missing order identity', () => {
    assert.equal(buildPurchaseAnalytics('synthetic-order', null), null);
    assert.equal(
      buildPurchaseAnalytics('synthetic-order', { ...paid, status: 'PENDING' }),
      null,
    );
    assert.equal(buildPurchaseAnalytics('', paid), null);
  });

  it('preserves quantity and adds multiple line amounts exactly', () => {
    const result = buildPurchaseAnalytics('synthetic-order', {
      ...paid,
      amount: 8300,
      items: [
        { ...paid.items![0], quantity: 2 },
        { ...paid.items![0], productName: 'Fixture pear', unitPrice: 1500 },
      ],
    });
    assert.equal(result?.value, 5300);
    assert.equal(result?.items[0].quantity, 2);
  });

  for (const invalid of [
    { status: 'PENDING' },
    { amount: 4901 },
    { amount: NaN },
    { shippingFee: undefined },
    { shippingFee: -1 },
    { shippingFee: 0.5 },
    { items: [] },
    { items: [{ ...paid.items![0], unitPrice: 0 }] },
    { items: [{ ...paid.items![0], unitPrice: 1.5 }] },
    { items: [{ ...paid.items![0], quantity: 0 }] },
    { items: [{ ...paid.items![0], quantity: NaN }] },
    { items: [{ ...paid.items![0], productName: '   ' }] },
    { items: Array.from({ length: 201 }, () => paid.items![0]) },
    {
      amount: Number.MAX_SAFE_INTEGER,
      items: [
        { ...paid.items![0], unitPrice: Number.MAX_SAFE_INTEGER, quantity: 2 },
      ],
    },
  ]) {
    it('does not emit an inconsistent or unverified monetary snapshot', () => {
      assert.equal(
        buildPurchaseAnalytics('synthetic-order', {
          ...paid,
          ...invalid,
        } as OrderRecord),
        null,
      );
    });
  }
});
