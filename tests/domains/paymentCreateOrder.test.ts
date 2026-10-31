import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createVerifiedPendingOrder } from '../../domains/payment/data/payment.create-order';
import { hasMatchingModernTossKeys } from '../../domains/payment/pg-toss/toss.configuration';

// Synthetic non-credential strings exercise key-family and mode validation.
const keys = {
  clientKey: 'test_gck_synthetic',
  secretKey: 'test_gsk_synthetic',
};
const base = {
  podIds: ['synthetic-pod'],
  items: [
    {
      podId: 'synthetic-pod',
      productName: 'Fixture',
      optionLabel: '1 unit',
      quantity: 2,
      unitPrice: 500,
      imageUrl: '',
    },
  ],
  shippingFee: 3000,
  status: 'PENDING' as const,
};

describe('payment order pre-RPC validation', () => {
  it('valid positive prices calculate the exact total before one insert', async () => {
    let calls = 0;
    const result = await createVerifiedPendingOrder(
      base,
      keys,
      async (order) => {
        calls += 1;
        assert.equal(order.amount, 4000);
        return {
          orderId: 'synthetic-order',
          subtotal: 1000,
          shippingFee: 3000,
          total: 4000,
        };
      },
    );
    assert.equal(calls, 1);
    assert.equal(result.total, 4000);
  });

  for (const price of [
    undefined,
    null,
    NaN,
    0,
    -1,
    0.5,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    it(`missing or invalid price ${String(price)} rejects before any RPC`, async () => {
      let calls = 0;
      await assert.rejects(
        () =>
          createVerifiedPendingOrder(
            {
              ...base,
              items: [{ ...base.items[0], unitPrice: price as number }],
            },
            keys,
            async () => {
              calls += 1;
              throw new Error('RPC must not run');
            },
          ),
        /verify the order total/,
      );
      assert.equal(calls, 0);
    });
  }

  for (const invalidKeys of [
    { clientKey: undefined, secretKey: keys.secretKey },
    { clientKey: keys.clientKey, secretKey: undefined },
    { clientKey: 'test_ck_synthetic', secretKey: 'test_sk_synthetic' },
    { clientKey: 'test_gck_synthetic', secretKey: 'live_gsk_synthetic' },
    { clientKey: 'live_gck_synthetic', secretKey: 'test_gsk_synthetic' },
  ]) {
    it('missing, legacy, and mixed test/live keys reject before RPC without key disclosure', async () => {
      let calls = 0;
      await assert.rejects(
        () =>
          createVerifiedPendingOrder(base, invalidKeys, async () => {
            calls += 1;
            throw new Error('RPC must not run');
          }),
        (error: Error) => {
          assert.equal(
            error.message,
            'Payment is unavailable. Please contact customer support.',
          );
          return true;
        },
      );
      assert.equal(calls, 0);
    });
  }

  it('matching modern test and live families are recognized', () => {
    assert.equal(
      hasMatchingModernTossKeys(keys.clientKey, keys.secretKey),
      true,
    );
    assert.equal(
      hasMatchingModernTossKeys('live_gck_synthetic', 'live_gsk_synthetic'),
      true,
    );
  });
});
