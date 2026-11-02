import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  dayKst,
  paymentMode,
  periodFromQuery,
  revenueReport,
  reviewState,
  reviewStates,
  parseOperation,
  operationAttempt,
  type OrderSnapshot,
  type OperationEvent,
} from '../../domains/admin/operations';
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= 'synthetic-key';
import {
  readPages,
  recordOperation,
  operationOrderDetail,
  readOperationEvents,
} from '../../domains/admin/operations.server';
import type { createAdminClient } from '../../shared/lib/supabase/admin';
type Client = ReturnType<typeof createAdminClient>;
const paid = (values: Partial<OrderSnapshot> = {}): OrderSnapshot => ({
  id: 'o1',
  status: 'paid',
  payment_mode: 'live',
  total: 1200,
  subtotal: 1000,
  shipping_fee: 300,
  discount: 100,
  created_at: '2026-10-31T00:00:00Z',
  paid_at: '2026-11-01T15:00:00Z',
  ...values,
});
const event = (values: Partial<OperationEvent> = {}): OperationEvent => ({
  id: '00000000-0000-4000-8000-000000000001',
  sequence: 1,
  entity_kind: 'order',
  entity_id: 'o1',
  action: 'note',
  note: 'Checked record',
  created_at: '2026-11-02T00:00:00Z',
  ...values,
});
const operation = {
  id: '00000000-0000-4000-8000-000000000001',
  entityKind: 'order',
  entityId: 'o1',
  action: 'note',
  note: 'Checked record',
  expectedRevision: 0,
};
const status = (number: number) => (error: unknown) =>
  !!error &&
  typeof error === 'object' &&
  'status' in error &&
  error.status === number;
describe('operational reporting', () => {
  it('uses paid date at exact KST day boundaries and fills zero days', () => {
    const report = revenueReport(
      [
        paid(),
        paid({ id: 'o2', paid_at: '2026-11-01T14:59:59Z' }),
        paid({ id: 'pending', status: 'pending' }),
      ],
      { from: '2026-11-02', to: '2026-11-03' },
      'live',
    );
    assert.equal(report.amount, 1200);
    assert.equal(report.orders, 1);
    assert.equal(report.average, 1200);
    assert.deepEqual(report.daily, [
      { day: '2026-11-02', amount: 1200, orders: 1 },
      { day: '2026-11-03', amount: 0, orders: 0 },
    ]);
    assert.equal(report.refundAmount, null);
    assert.equal(report.netCollected, null);
  });
  it('never combines mock/test/unclassified with live and does not infer missing modes', () => {
    const orders = [
      paid(),
      paid({ id: 'm', payment_mode: 'mock', total: 200 }),
      paid({ id: 't', payment_mode: 'test', total: 300 }),
      paid({ id: 'u', payment_mode: null, total: 400 }),
      paid({ id: 'x', payment_mode: 'other', total: 500 }),
    ];
    const period = { from: '2026-11-02', to: '2026-11-02' };
    assert.equal(revenueReport(orders, period, 'live').amount, 1200);
    assert.equal(revenueReport(orders, period, 'test').amount, 500);
    assert.equal(revenueReport(orders, period, 'unknown').amount, 900);
    assert.equal(paymentMode('LIVE'), 'unknown');
  });
  it('rejects invalid dates/ranges instead of guessing and never turns missing totals into zero sales', () => {
    for (const query of [
      'from=2026-02-30&to=2026-03-02',
      'from=2026-11-02&to=2026-11-01',
      'from=2024-01-01&to=2026-11-01',
    ])
      assert.throws(
        () => periodFromQuery(new URLSearchParams(query)),
        status(400),
      );
    const report = revenueReport(
      [
        paid({ paid_at: null }),
        paid({ total: null }),
        paid({ total: -1 }),
        paid({ total: 1.5 }),
      ],
      { from: '2026-11-02', to: '2026-11-02' },
      'live',
    );
    assert.equal(report.orders, 0);
    assert.equal(report.invalidPaidOrders, 4);
    assert.equal(dayKst('invalid'), null);
  });
  it('derives archive/review state in sequence order without changing revenue', () => {
    const events = [
      event({ sequence: 5, action: 'restore' }),
      event({ sequence: 3, action: 'flag' }),
      event({ sequence: 4, action: 'archive' }),
      event({ sequence: 6, action: 'resolve' }),
      event({ sequence: 7, entity_kind: 'pod', action: 'archive' }),
    ];
    assert.deepEqual(reviewState(events, 'order', 'o1'), {
      archived: false,
      review: false,
      revision: 6,
    });
    assert.deepEqual(reviewState(events, 'order', 'other'), {
      archived: false,
      review: false,
      revision: 0,
    });
    assert.equal(
      revenueReport([paid()], { from: '2026-11-02', to: '2026-11-02' }, 'live')
        .amount,
      1200,
    );
  });
  it('validates action identity, nonempty reasons, revision and exact fields', () => {
    assert.equal(
      parseOperation({ ...operation, note: '  Checked record  ' }).note,
      'Checked record',
    );
    for (const patch of [
      { id: 'bad' },
      { entityId: 'x/../y' },
      { entityKind: 'user' },
      { action: 'delete' },
      { action: 'refund' },
      { note: ' ' },
      { note: 'x'.repeat(1001) },
      { expectedRevision: -1 },
      { expectedRevision: null },
      { extra: true },
    ])
      assert.throws(
        () => parseOperation({ ...operation, ...patch }),
        status(400),
      );
  });
});
describe('indexed operations state', () => {
  it('agrees with per-record state without mixing kinds or mutating events', () => {
    const input = [
      event({ sequence: 4, action: 'restore' }),
      event({ sequence: 1, action: 'archive' }),
      event({ sequence: 3, action: 'flag' }),
      event({ sequence: 2, entity_kind: 'pod', action: 'archive' }),
    ];
    const before = structuredClone(input);
    const indexed = reviewStates(input);
    assert.deepEqual(
      indexed.get('order:o1'),
      reviewState(input, 'order', 'o1'),
    );
    assert.deepEqual(indexed.get('pod:o1'), reviewState(input, 'pod', 'o1'));
    assert.deepEqual(input, before);
  });
});
describe('operation retry identity', () => {
  it('preserves one request after lost acknowledgement and revision-only refresh', () => {
    let generated = 0;
    const create = () => `request-${++generated}`;
    const first = operationAttempt({ ...operation }, null, create);
    const refreshed = { ...operation, expectedRevision: 99 };
    const retry = operationAttempt(refreshed, first, create);
    assert.equal(retry.id, first.id);
    assert.equal(generated, 1);
    assert.notEqual(
      operationAttempt(
        { ...refreshed, note: 'Different action' },
        retry,
        create,
      ).id,
      first.id,
    );
  });
});
describe('complete operational reads', () => {
  it('reads beyond the default API page and never silently truncates', async () => {
    const rows = Array.from({ length: 501 }, (_, id) => ({ id }));
    const calls: number[] = [];
    const result = await readPages(async (start, end) => {
      calls.push(start);
      return { data: rows.slice(start, end + 1), error: null, count: 501 };
    });
    assert.equal(result.length, 501);
    assert.deepEqual(calls, [0, 500]);
  });
  it('fails closed on missing pages, changing totals or duplicates', async () => {
    await assert.rejects(
      readPages(async () => ({ data: [], error: null, count: 1 })),
      status(503),
    );
    let call = 0;
    await assert.rejects(
      readPages(async () => ({
        data: Array.from({ length: 500 }, (_, id) => ({ id })),
        error: null,
        count: call++ ? 502 : 501,
      })),
      status(409),
    );
    await assert.rejects(
      readPages(async () => ({
        data: [{ id: 'same' }, { id: 'same' }],
        error: null,
        count: 2,
      })),
      status(409),
    );
    await assert.rejects(
      readPages(async () => ({
        data: null,
        error: { code: '42501' },
        count: null,
      })),
      status(503),
    );
  });
});
function fake(
  results: Record<string, unknown>[],
  calls: { operation: string; value: unknown }[] = [],
): Client {
  return {
    from(table: string) {
      calls.push({ operation: 'from', value: table });
      const result = results.shift();
      if (!result) throw Error('Unexpected query');
      const builder = new Proxy(
        {},
        {
          get(_target, key) {
            if (key === 'then')
              return Promise.resolve(result).then.bind(Promise.resolve(result));
            return (...args: unknown[]) => {
              calls.push({ operation: String(key), value: args });
              return builder;
            };
          },
        },
      );
      return builder;
    },
    rpc(name: string, args: unknown) {
      calls.push({ operation: name, value: args });
      return Promise.resolve(results.shift());
    },
  } as unknown as Client;
}
describe('operational server contracts', () => {
  it('records only validated operations with the independently authenticated actor and strips actor fields', async () => {
    const calls: { operation: string; value: unknown }[] = [];
    const result = await recordOperation(
      'verified-admin',
      operation,
      fake(
        [{ data: { ...event(), actor_id: 'private-auth-id' }, error: null }],
        calls,
      ),
    );
    assert.equal('actor_id' in result, false);
    assert.equal(
      (calls[0].value as Record<string, unknown>).p_actor,
      'verified-admin',
    );
    assert.equal(
      (calls[0].value as Record<string, unknown>).p_expected_revision,
      0,
    );
  });
  it('reports stale writes and missing setup; does not pretend to save', async () => {
    await assert.rejects(
      recordOperation(
        'admin',
        operation,
        fake([
          { error: { message: 'OP_CONFLICT', code: 'P0001' }, data: null },
        ]),
      ),
      status(409),
    );
    await assert.rejects(
      recordOperation(
        'admin',
        operation,
        fake([
          { error: { message: 'OP_NOT_FOUND', code: 'P0001' }, data: null },
        ]),
      ),
      status(404),
    );
    await assert.rejects(
      recordOperation(
        'admin',
        operation,
        fake([{ error: { message: 'missing', code: 'PGRST202' }, data: null }]),
      ),
      status(503),
    );
  });
  it('distinguishes missing event storage from ordinary DB failures', async () => {
    const missing = fake([
      { data: null, error: { code: 'PGRST205' }, count: null },
      { data: null, error: { code: 'PGRST205' } },
    ]);
    assert.equal((await readOperationEvents(missing)).setupRequired, true);
    await assert.rejects(
      readOperationEvents(
        fake([
          { data: null, error: { code: '42501' }, count: null },
          { data: null, error: { code: '42501' } },
        ]),
      ),
      status(503),
    );
  });
  it('masks phone and excludes account/payment/participant identities from detail output', async () => {
    const result = await operationOrderDetail(
      'o1',
      fake([
        { data: { ...paid(), recipient_phone: '01012345678' }, error: null },
        {
          data: [
            {
              id: 'i1',
              product_name: 'Apple',
              portion_label: '1',
              unit_price: 1,
              product_id: 'p1',
              pod_id: 'g1',
              participant_id: 44,
              order_id: 'o1',
              image_url: 'unused',
            },
          ],
          error: null,
          count: 1,
        },
        { data: [], error: null, count: 0 },
      ]),
    );
    assert.equal(result.order.recipient_phone, '•••• 5678');
    assert.equal('participant_id' in result.items[0], false);
    assert.equal('image_url' in result.items[0], false);
    assert.equal(result.state.revision, 0);
  });
  it('fully masks short phone values and queries only the selected entity activity', async () => {
    const calls: { operation: string; value: unknown }[] = [];
    const result = await operationOrderDetail(
      'o1',
      fake(
        [
          { data: { ...paid(), recipient_phone: '12' }, error: null },
          { data: [], error: null, count: 0 },
          { data: [], error: null, count: 0 },
        ],
        calls,
      ),
    );
    assert.equal(result.order.recipient_phone, '••••');
    assert.ok(
      calls.some(
        (call) =>
          call.operation === 'eq' &&
          JSON.stringify(call.value) ===
            JSON.stringify(['entity_kind', 'order']),
      ),
    );
    assert.ok(
      calls.some(
        (call) =>
          call.operation === 'eq' &&
          JSON.stringify(call.value) === JSON.stringify(['entity_id', 'o1']),
      ),
    );
  });
  it('masks formatted short phone numbers by digit count', async () => {
    for (const phone of ['12-34', '+1 2', '(12)']) {
      const result = await operationOrderDetail(
        'o1',
        fake([
          { data: { ...paid(), recipient_phone: phone }, error: null },
          { data: [], error: null, count: 0 },
          { data: [], error: null, count: 0 },
        ]),
      );
      assert.equal(result.order.recipient_phone, '••••');
    }
  });
});
