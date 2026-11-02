import { AdminError } from './access';

export type OrderSnapshot = {
  id: string;
  status: string | null;
  payment_mode: string | null;
  total: number | null;
  subtotal: number | null;
  shipping_fee: number | null;
  discount: number | null;
  created_at: string | null;
  paid_at: string | null;
};
export type OperationEvent = {
  id: string;
  sequence: number;
  entity_kind: 'order' | 'pod';
  entity_id: string;
  action: 'note' | 'flag' | 'resolve' | 'archive' | 'restore';
  note: string;
  created_at: string;
};
export type ReviewState = {
  archived: boolean;
  review: boolean;
  revision: number;
};
export const paymentModes = ['live', 'test', 'unknown'] as const;
export type PaymentMode = (typeof paymentModes)[number];
export function paymentMode(mode: string | null): PaymentMode {
  if (mode === 'live') return 'live';
  if (mode === 'test' || mode === 'mock') return 'test';
  return 'unknown';
}
export function dayKst(value: string | null) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time)
    ? new Date(time + 9 * 3600_000).toISOString().slice(0, 10)
    : null;
}
export function reviewState(
  events: OperationEvent[],
  kind: string,
  id: string,
): ReviewState {
  const state = { archived: false, review: false, revision: 0 };
  for (const event of events
    .filter((e) => e.entity_kind === kind && e.entity_id === id)
    .sort((a, b) => a.sequence - b.sequence)) {
    state.revision = event.sequence;
    if (event.action === 'archive') state.archived = true;
    if (event.action === 'restore') state.archived = false;
    if (event.action === 'flag') state.review = true;
    if (event.action === 'resolve') state.review = false;
  }
  return state;
}
export function reviewStates(events: OperationEvent[]) {
  const states = new Map<string, ReviewState>();
  for (const event of events.slice().sort((a, b) => a.sequence - b.sequence)) {
    const key = event.entity_kind + ':' + event.entity_id;
    const state = states.get(key) ?? {
      archived: false,
      review: false,
      revision: 0,
    };
    state.revision = event.sequence;
    if (event.action === 'archive') state.archived = true;
    if (event.action === 'restore') state.archived = false;
    if (event.action === 'flag') state.review = true;
    if (event.action === 'resolve') state.review = false;
    states.set(key, state);
  }
  return states;
}
export type Period = { from: string; to: string };
export function periodFromQuery(
  query: URLSearchParams,
  now = new Date(),
): Period {
  const today = dayKst(now.toISOString())!;
  const to = query.get('to') ?? today;
  const from =
    query.get('from') ??
    dayKst(
      new Date(Date.parse(now.toISOString()) - 29 * 86400_000).toISOString(),
    )!;
  const validDay = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (
    !validDay(from) ||
    !validDay(to) ||
    from > to ||
    Date.parse(to) - Date.parse(from) > 366 * 86400_000
  )
    throw new AdminError(400, 'Choose a valid date range of up to 367 days.');
  return { from, to };
}
export function revenueReport(
  orders: OrderSnapshot[],
  period: Period,
  mode: PaymentMode,
) {
  const days = [];
  for (
    let time = Date.parse(period.from);
    time <= Date.parse(period.to);
    time += 86400_000
  )
    days.push(new Date(time).toISOString().slice(0, 10));
  const daily = new Map(
    days.map((day) => [day, { day, amount: 0, orders: 0 }]),
  );
  const breakdown = {
    live: { amount: 0, orders: 0 },
    test: { amount: 0, orders: 0 },
    unknown: { amount: 0, orders: 0 },
  };
  let invalidPaidOrders = 0;
  for (const order of orders) {
    if (order.status !== 'paid') continue;
    const day = dayKst(order.paid_at);
    if (!day || !Number.isSafeInteger(order.total) || (order.total ?? -1) < 0) {
      invalidPaidOrders++;
      continue;
    }
    if (day < period.from || day > period.to) continue;
    const bucket = paymentMode(order.payment_mode);
    if (!Number.isSafeInteger(breakdown[bucket].amount + order.total!))
      throw new AdminError(
        503,
        'Recorded amounts exceed the safe reporting range.',
      );
    breakdown[bucket].amount += order.total!;
    breakdown[bucket].orders++;
    if (bucket === mode) {
      const point = daily.get(day)!;
      point.amount += order.total!;
      point.orders++;
    }
  }
  const selected = breakdown[mode];
  return {
    ...selected,
    average: selected.orders
      ? Math.round(selected.amount / selected.orders)
      : 0,
    daily: [...daily.values()],
    breakdown,
    invalidPaidOrders,
    refundAmount: null,
    netCollected: null,
    basis:
      'Paid date · Asia/Seoul · KRW · includes recorded shipping and discounts. Refund and settlement data are not connected.',
  };
}
export function parseOperation(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AdminError(400, 'Invalid operation.');
  const body = input as Record<string, unknown>;
  if (
    Object.keys(body).sort().join(',') !==
    'action,entityId,entityKind,expectedRevision,id,note'
  )
    throw new AdminError(400, 'Unexpected operation fields.');
  if (
    typeof body.id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      body.id,
    ) ||
    !['order', 'pod'].includes(String(body.entityKind)) ||
    typeof body.entityId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(body.entityId) ||
    !['note', 'flag', 'resolve', 'archive', 'restore'].includes(
      String(body.action),
    ) ||
    typeof body.note !== 'string' ||
    !body.note.trim() ||
    body.note.trim().length > 1000 ||
    !Number.isSafeInteger(body.expectedRevision) ||
    (body.expectedRevision as number) < 0
  )
    throw new AdminError(
      400,
      'Choose an action, enter a reason (1–1000 characters), and reload the current record.',
    );
  return {
    id: body.id,
    entityKind: body.entityKind as OperationEvent['entity_kind'],
    entityId: body.entityId,
    action: body.action as OperationEvent['action'],
    note: body.note.trim(),
    expectedRevision: body.expectedRevision as number,
  };
}

/** One logical action keeps its key across a lost response and revision-only reload. */
export function operationAttempt(
  body: { entityKind: string; entityId: string; action: string; note: string },
  pending: { signature: string; id: string } | null,
  createId: () => string,
) {
  const signature = JSON.stringify([
    body.entityKind,
    body.entityId,
    body.action,
    body.note.trim(),
  ]);
  return {
    signature,
    id: pending?.signature === signature ? pending.id : createId(),
  };
}
