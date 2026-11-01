import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/lib/supabase/database.types';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { AdminError } from './access';
import {
  parseOperation,
  type OperationEvent,
  type OrderSnapshot,
  type PaymentMode,
  periodFromQuery,
  revenueReport,
  reviewState,
  reviewStates,
} from './operations';

type Tables = Database['public']['Tables'];
type Pod = Pick<
  Tables['pods']['Row'],
  | 'id'
  | 'pod_no'
  | 'status'
  | 'capacity'
  | 'member_count'
  | 'created_at'
  | 'recruit_deadline'
  | 'payment_due_at'
  | 'product_id'
  | 'cancel_reason'
  | 'confirmed_at'
  | 'cancelled_at'
  | 'matched_at'
>;
type Participant = Pick<
  Tables['pod_participants']['Row'],
  'id' | 'pod_id' | 'is_active' | 'status' | 'paid_at' | 'refund_required'
>;
type OperationalDb = {
  public: {
    Tables: { [K in keyof Tables]: Tables[K] & { Relationships: [] } } & {
      admin_operation_events: {
        Row: OperationEvent;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Database['public']['Views'];
    Functions: {
      admin_record_operation: {
        Args: {
          p_id: string;
          p_actor: string;
          p_entity_kind: string;
          p_entity_id: string;
          p_action: string;
          p_note: string;
          p_expected_revision: number;
        };
        Returns: OperationEvent;
      };
    };
  };
};
const db = (client: SupabaseClient<Database>) =>
  client as unknown as SupabaseClient<OperationalDb>;
export async function readPages<T extends { id: string | number }>(
  fetchPage: (
    offset: number,
    end: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown; count: number | null }>,
) {
  const rows: T[] = [];
  let expected: number | null = null;
  for (let offset = 0; offset < 50000; offset += 500) {
    const result = await fetchPage(offset, offset + 499);
    if (result.error || !result.data || result.count === null)
      throw new AdminError(
        503,
        'Operational data could not be loaded completely. Retry.',
      );
    if (expected !== null && expected !== result.count)
      throw new AdminError(
        409,
        'Records changed while loading. Refresh the workspace.',
      );
    expected = result.count;
    rows.push(...result.data);
    if (rows.length >= expected) {
      if (
        rows.length !== expected ||
        new Set(rows.map((row) => row.id)).size !== rows.length
      )
        throw new AdminError(
          409,
          'Records changed while loading. Refresh the workspace.',
        );
      return rows;
    }
    if (result.data.length !== 500)
      throw new AdminError(503, 'Operational data is incomplete. Retry.');
  }
  throw new AdminError(
    503,
    'This dataset needs server-side aggregation before it can be displayed completely.',
  );
}
export async function readOperationEvents(
  client = createAdminClient(),
  target?: { kind: 'order' | 'pod'; id: string },
) {
  try {
    return {
      setupRequired: false,
      events: await readPages<OperationEvent>((start, end) => {
        let query = db(client)
          .from('admin_operation_events')
          .select('id,sequence,entity_kind,entity_id,action,note,created_at', {
            count: 'exact',
          });
        if (target)
          query = query
            .eq('entity_kind', target.kind)
            .eq('entity_id', target.id);
        return query.order('sequence', { ascending: true }).range(start, end);
      }),
    };
  } catch (error) {
    // Distinguish an unapplied migration from a read failure; never imply a successful save.
    const probe = await db(client)
      .from('admin_operation_events')
      .select('id')
      .limit(1);
    if (probe.error?.code === 'PGRST205' || probe.error?.code === '42P01')
      return { setupRequired: true, events: [] as OperationEvent[] };
    throw error;
  }
}
export async function operationsSnapshot(
  query: URLSearchParams,
  client = createAdminClient(),
) {
  const period = periodFromQuery(query);
  const mode = query.get('mode') ?? 'live';
  if (!['live', 'test', 'unknown'].includes(mode))
    throw new AdminError(400, 'Choose a payment mode.');
  const [orders, pods, participants, products, links, activity] =
    await Promise.all([
      readPages<OrderSnapshot>((start, end) =>
        db(client)
          .from('orders')
          .select(
            'id,status,payment_mode,total,subtotal,shipping_fee,discount,created_at,paid_at',
            { count: 'exact' },
          )
          .order('id')
          .range(start, end),
      ),
      readPages<Pod>((start, end) =>
        db(client)
          .from('pods')
          .select(
            'id,pod_no,status,capacity,member_count,created_at,recruit_deadline,payment_due_at,product_id,cancel_reason,confirmed_at,cancelled_at,matched_at',
            { count: 'exact' },
          )
          .order('id')
          .range(start, end),
      ),
      readPages<Participant>((start, end) =>
        db(client)
          .from('pod_participants')
          .select('id,pod_id,is_active,status,paid_at,refund_required', {
            count: 'exact',
          })
          .order('id')
          .range(start, end),
      ),
      readPages<{ id: string; name: string | null }>((start, end) =>
        db(client)
          .from('products')
          .select('id,name', { count: 'exact' })
          .order('id')
          .range(start, end),
      ),
      readPages<
        Pick<Tables['order_items']['Row'], 'id' | 'pod_id' | 'order_id'>
      >((start, end) =>
        db(client)
          .from('order_items')
          .select('id,pod_id,order_id', { count: 'exact' })
          .order('id')
          .range(start, end),
      ),
      readOperationEvents(client),
    ]);
  const events = activity.events;
  const states = reviewStates(events);
  const stateFor = (kind: string, id: string) =>
    states.get(kind + ':' + id) ?? {
      archived: false,
      review: false,
      revision: 0,
    };
  const productsById = new Map(products.map((p) => [p.id, p.name]));
  const membersByPod = new Map<
    string,
    {
      activeCount: number;
      paidCount: number;
      refundRequired: number;
      paymentReady: number;
    }
  >();
  for (const member of participants) {
    if (!member.pod_id) continue;
    const tally = membersByPod.get(member.pod_id) ?? {
      activeCount: 0,
      paidCount: 0,
      refundRequired: 0,
      paymentReady: 0,
    };
    if (member.is_active === true) tally.activeCount++;
    if (member.paid_at !== null) tally.paidCount++;
    if (member.refund_required === true) tally.refundRequired++;
    if (member.is_active === true && member.status === 'payment_ready')
      tally.paymentReady++;
    membersByPod.set(member.pod_id, tally);
  }
  const ordersByPod = new Map<string, Set<string>>();
  for (const link of links) {
    if (!link.pod_id || !link.order_id) continue;
    const ids = ordersByPod.get(link.pod_id) ?? new Set<string>();
    ids.add(link.order_id);
    ordersByPod.set(link.pod_id, ids);
  }
  const now = Date.now();
  const groupRows = pods.map((pod) => {
    const deadline =
      pod.status === 'recruiting'
        ? pod.recruit_deadline
        : pod.status === 'matched'
          ? pod.payment_due_at
          : null;
    return {
      ...pod,
      productName:
        productsById.get(pod.product_id ?? '') ?? 'Product unavailable',
      orderIds: [...(ordersByPod.get(pod.id) ?? [])],
      ...(membersByPod.get(pod.id) ?? {
        activeCount: 0,
        paidCount: 0,
        refundRequired: 0,
        paymentReady: 0,
      }),
      dueSoon:
        !!deadline &&
        Date.parse(deadline) > now &&
        Date.parse(deadline) <= now + 86400_000,
      overdue: !!deadline && Date.parse(deadline) <= now,
      ...stateFor('pod', pod.id),
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    period,
    mode: mode as PaymentMode,
    revenue: revenueReport(orders, period, mode as PaymentMode),
    previousRevenue: revenueReport(
      orders,
      {
        from: new Date(
          Date.parse(period.from) -
            (Date.parse(period.to) - Date.parse(period.from) + 86400_000),
        )
          .toISOString()
          .slice(0, 10),
        to: new Date(Date.parse(period.from) - 86400_000)
          .toISOString()
          .slice(0, 10),
      },
      mode as PaymentMode,
    ),
    orders: orders.map((order) => ({
      ...order,
      ...stateFor('order', order.id),
    })),
    groups: groupRows,
    activity: events.slice().reverse(),
    setupRequired: activity.setupRequired,
    attention: {
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      dueSoon: groupRows.filter((p) => p.dueSoon).length,
      overdue: groupRows.filter((p) => p.overdue).length,
      refundRequired: groupRows.reduce((n, p) => n + p.refundRequired, 0),
    },
  };
}
export async function operationOrderDetail(
  id: string,
  client = createAdminClient(),
) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
    throw new AdminError(400, 'Invalid order ID.');
  const [order, items, activity] = await Promise.all([
    db(client)
      .from('orders')
      .select(
        'id,status,payment_mode,total,subtotal,base_shipping_fee,fresh_packaging_fee,shipping_fee,discount,payment_method,created_at,paid_at,recipient_name,recipient_phone,recipient_address,recipient_address_detail,postal_code',
      )
      .eq('id', id)
      .maybeSingle(),
    readPages<
      Pick<
        Tables['order_items']['Row'],
        | 'id'
        | 'product_name'
        | 'portion_label'
        | 'unit_price'
        | 'product_id'
        | 'pod_id'
      >
    >((start, end) =>
      db(client)
        .from('order_items')
        .select('id,product_name,portion_label,unit_price,product_id,pod_id', {
          count: 'exact',
        })
        .eq('order_id', id)
        .order('id')
        .range(start, end),
    ),
    readOperationEvents(client, { kind: 'order', id }),
  ]);
  if (order.error)
    throw new AdminError(503, 'Order details could not be loaded.');
  if (!order.data) throw new AdminError(404, 'Order not found.');
  const phone = order.data.recipient_phone;
  return {
    order: {
      ...order.data,
      recipient_phone: phone
        ? phone.replace(/\D/g, '').length > 4
          ? `•••• ${phone.replace(/\D/g, '').slice(-4)}`
          : '••••'
        : null,
    },
    items: items.map(
      ({
        id,
        product_name,
        portion_label,
        unit_price,
        product_id,
        pod_id,
      }) => ({
        id,
        product_name,
        portion_label,
        unit_price,
        product_id,
        pod_id,
      }),
    ),
    events: activity.events
      .filter((e) => e.entity_kind === 'order' && e.entity_id === id)
      .reverse(),
    state: reviewState(activity.events, 'order', id),
    setupRequired: activity.setupRequired,
  };
}
export async function recordOperation(
  actor: string,
  input: unknown,
  client = createAdminClient(),
) {
  const op = parseOperation(input);
  const result = await db(client).rpc('admin_record_operation', {
    p_id: op.id,
    p_actor: actor,
    p_entity_kind: op.entityKind,
    p_entity_id: op.entityId,
    p_action: op.action,
    p_note: op.note,
    p_expected_revision: op.expectedRevision,
  });
  if (result.error) {
    const message = result.error.message;
    if (message.includes('OP_CONFLICT'))
      throw new AdminError(
        409,
        'This record changed. Reload before saving. Your note is still available.',
      );
    if (message.includes('OP_NOT_FOUND'))
      throw new AdminError(404, 'Record not found.');
    if (result.error.code === 'PGRST202')
      throw new AdminError(
        503,
        'The operations migration must be applied before saving.',
      );
    throw new AdminError(
      503,
      'The operation could not be recorded. Retry with the same request.',
    );
  }
  const e = result.data;
  return {
    id: e.id,
    sequence: e.sequence,
    entity_kind: e.entity_kind,
    entity_id: e.entity_id,
    action: e.action,
    note: e.note,
    created_at: e.created_at,
  };
}
