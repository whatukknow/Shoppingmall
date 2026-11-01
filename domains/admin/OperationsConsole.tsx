'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { foodLabel } from '@/shared/lib/food-label';
import {
  dayKst,
  paymentMode,
  operationAttempt,
  periodFromQuery,
  type OperationEvent,
} from './operations';
import type {
  operationsSnapshot,
  operationOrderDetail,
} from './operations.server';
type Snapshot = Awaited<ReturnType<typeof operationsSnapshot>>;
type Detail = Awaited<ReturnType<typeof operationOrderDetail>>;
const tabs = ['Dashboard', 'Orders', 'Buying Groups', 'Activity'] as const;
const money = (value: number | null) =>
  value === null
    ? 'Not connected'
    : new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0,
      }).format(value);
const date = (value: string | null) =>
  value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Seoul',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Not recorded';
const modeLabel = (mode: string) =>
  mode === 'live' ? 'Live' : mode === 'test' ? 'Test / mock' : 'Unclassified';
async function request<T>(
  url: string,
  signal?: AbortSignal,
  body?: unknown,
): Promise<T> {
  const response = await fetch('/api/admin/operations' + url, {
    signal,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error?.message ?? 'The request could not be completed.',
    );
  return result.data;
}
function Timeline({ events }: { events: OperationEvent[] }) {
  return events.length ? (
    <ol className="lp-ops-timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span className="lp-ops-badge">{event.action}</span>
          <time>{date(event.created_at)} KST</time>
          <p>{event.note}</p>
          <small>Administrator · record {event.sequence}</small>
        </li>
      ))}
    </ol>
  ) : (
    <p>No administrator actions recorded for this record yet.</p>
  );
}
export function OperationsConsole() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Dashboard');
  const [from, setFrom] = useState(() =>
    dayKst(new Date(Date.now() - 29 * 86400_000).toISOString())!,
  );
  const [to, setTo] = useState(() => dayKst(new Date().toISOString())!);
  const [mode, setMode] = useState('live');
  const [reportInput, setReportInput] = useState<{
    from: string;
    to: string;
    mode: string;
  } | null>(null);
  const [filterError, setFilterError] = useState('');
  const input = reportInput ?? { from, to, mode };
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [archive, setArchive] = useState('active');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [selected, setSelected] = useState<{
    kind: 'order' | 'pod';
    id: string;
  } | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [action, setAction] = useState<OperationEvent['action']>('note');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<{
    signature: string;
    id: string;
  } | null>(null);
  const [activityKind, setActivityKind] = useState('all');
  const [activityAction, setActivityAction] = useState('all');
  const loadVersion = useRef(0);
  const detailVersion = useRef(0);
  const detailPanel = useRef<HTMLElement>(null);
  const parameters = new URLSearchParams({ from, to, mode }).toString();
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const version = ++loadVersion.current;
      const next = await request<Snapshot>('?' + parameters, signal);
      if (version === loadVersion.current && !signal?.aborted) setData(next);
      return next;
    },
    [parameters],
  );
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refresh]);
  useEffect(() => {
    if (selected?.kind !== 'order') return;
    const controller = new AbortController();
    request<Detail>(
      '/orders/' + encodeURIComponent(selected.id),
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) setDetail(result);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setDetailError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selected]);
  function select(kind: 'order' | 'pod', id: string) {
    if (busy) return;
    detailVersion.current++;
    setDetail(null);
    setDetailError('');
    setDetailLoading(kind === 'order');
    setSelected({ kind, id });
    setNote('');
    setAction('note');
    setPending(null);
    setNotice('');
  }
  useEffect(() => {
    if (selected) {
      detailPanel.current?.focus();
      detailPanel.current?.scrollIntoView({ block: 'start' });
    }
  }, [selected]);
  async function reload() {
    const version = detailVersion.current;
    setError('');
    setLoading(true);
    try {
      await refresh();
      if (selected?.kind === 'order') {
        const nextDetail = await request<Detail>(
          '/orders/' + encodeURIComponent(selected.id),
        );
        if (version === detailVersion.current) setDetail(nextDetail);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed.');
    } finally {
      setLoading(false);
    }
  }
  const selectedGroup =
    selected?.kind === 'pod'
      ? data?.groups.find((p) => p.id === selected.id)
      : null;
  const currentState =
    selected?.kind === 'order'
      ? detail?.order.id === selected.id
        ? detail.state
        : undefined
      : selectedGroup;
  async function saveOperation(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !currentState || !data) return;
    const body = {
      entityKind: selected.kind,
      entityId: selected.id,
      action,
      note,
      expectedRevision: currentState.revision,
    };
    const attempt = operationAttempt(body, pending, () => crypto.randomUUID());
    const id = attempt.id;
    setPending(attempt);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await request('', undefined, { ...body, id });
      setNote('');
      setPending(null);
      setNotice(
        'Operation recorded. Payment, fulfilment and sales totals are unchanged.',
      );
      try {
        await refresh();
        if (selected.kind === 'order')
          setDetail(
            await request<Detail>('/orders/' + encodeURIComponent(selected.id)),
          );
      } catch {
        setError(
          'The operation was recorded, but the updated view could not be loaded. Refresh to continue.',
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not record this operation.',
      );
    } finally {
      setBusy(false);
    }
  }
  const visibleOrders = (data?.orders ?? [])
    .filter((order) => {
      const day = dayKst(order.created_at);
      return (
        order.id.toLowerCase().includes(query.toLowerCase()) &&
        (status === 'all' || (order.status ?? 'Unknown') === status) &&
        (archive === 'all' || order.archived === (archive === 'archived')) &&
        (!reviewOnly || order.review) &&
        paymentMode(order.payment_mode) === mode &&
        !!day &&
        day >= from &&
        day <= to
      );
    })
    .sort(
      (a, b) =>
        (b.created_at ?? '').localeCompare(a.created_at ?? '') ||
        a.id.localeCompare(b.id),
    );
  const visibleGroups = (data?.groups ?? [])
    .filter(
      (group) =>
        (group.id + ' ' + group.pod_no + ' ' + foodLabel(group.productName))
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === 'all' ||
          (status === 'due-soon' && group.dueSoon) ||
          (status === 'overdue' && group.overdue) ||
          (group.status ?? 'Unknown') === status) &&
        (archive === 'all' || group.archived === (archive === 'archived')) &&
        (!reviewOnly || group.review),
    )
    .sort(
      (a, b) =>
        Number(b.overdue) - Number(a.overdue) ||
        Number(b.dueSoon) - Number(a.dueSoon) ||
        (b.created_at ?? '').localeCompare(a.created_at ?? ''),
    );
  const visibleActivity = (data?.activity ?? []).filter(
    (e) =>
      (activityKind === 'all' || e.entity_kind === activityKind) &&
      (activityAction === 'all' || e.action === activityAction) &&
      (e.entity_id + ' ' + e.note).toLowerCase().includes(query.toLowerCase()),
  );
  const listCount =
    tab === 'Orders'
      ? visibleOrders.length
      : tab === 'Buying Groups'
        ? visibleGroups.length
        : visibleActivity.length;
  const totalPages = Math.max(1, Math.ceil(listCount / 25));
  const safePage = Math.min(listPage, totalPages);
  const start = (safePage - 1) * 25;
  const events =
    selected?.kind === 'order'
      ? (detail?.events ?? [])
      : (data?.activity.filter(
          (e) => e.entity_kind === 'pod' && e.entity_id === selected?.id,
        ) ?? []);
  function setReporting(next: { from?: string; to?: string; mode?: string }) {
    setReportInput(null);
    setFilterError('');
    if (
      (next.from ?? from) === from &&
      (next.to ?? to) === to &&
      (next.mode ?? mode) === mode
    )
      return;
    setLoading(true);
    setError('');
    setFrom(next.from ?? from);
    setTo(next.to ?? to);
    setMode(next.mode ?? mode);
  }
  function applyReporting() {
    try {
      periodFromQuery(new URLSearchParams(input));
      setFilterError('');
      setReporting(input);
      setReportInput(null);
    } catch (error) {
      setFilterError(
        error instanceof Error
          ? error.message
          : 'Choose a valid reporting period.',
      );
    }
  }
  function navigate(next: (typeof tabs)[number]) {
    setListPage(1);
    setTab(next);
    setStatus('all');
    setQuery('');
    setSelected(null);
    setNote('');
    setReviewOnly(false);
  }
  return (
    <div className="lp-admin lp-ops">
      <header className="lp-ops-header">
        <div>
          <p className="lp-admin-eyebrow">LITTLE PORTIONS / OPERATIONS</p>
          <h1>The daily picture.</h1>
          <p>
            Sales, orders and buying groups, with a clear record of every action
            here.
          </p>
        </div>
        <Link href="/admin" className="lp-admin-text-link">
          Products & Taste Finder ↗
        </Link>
      </header>
      <nav className="lp-ops-nav" aria-label="Operations navigation">
        {tabs.map((item) => (
          <button
            key={item}
            aria-pressed={tab === item}
            onClick={() => navigate(item)}
            disabled={busy}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="lp-ops-workspace">
        <div className="lp-ops-toolbar">
          <h2>{tab}</h2>
          <button
            className="lp-admin-button"
            onClick={reload}
            disabled={loading || busy}
          >
            Refresh data
          </button>
        </div>
        <fieldset disabled={busy || loading} className="lp-ops-filters">
          <legend>Reporting period & payment mode</legend>
          <label>
            From
            <input
              type="date"
              value={input.from}
              onChange={(e) =>
                setReportInput({ ...input, from: e.target.value })
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={input.to}
              onChange={(e) => setReportInput({ ...input, to: e.target.value })}
            />
          </label>
          <label>
            Payment mode
            <select
              value={input.mode}
              onChange={(e) =>
                setReportInput({ ...input, mode: e.target.value })
              }
            >
              <option value="live">Live payments</option>
              <option value="test">Test / mock</option>
              <option value="unknown">Unclassified</option>
            </select>
          </label>
          <button onClick={applyReporting}>Apply report</button>
          <button
            onClick={() =>
              setReporting({
                from: dayKst(
                  new Date(Date.now() - 6 * 86400_000).toISOString(),
                )!,
                to: dayKst(new Date().toISOString())!,
              })
            }
          >
            Last 7 days
          </button>
          <button
            onClick={() =>
              setReporting({
                from: dayKst(
                  new Date(Date.now() - 29 * 86400_000).toISOString(),
                )!,
                to: dayKst(new Date().toISOString())!,
              })
            }
          >
            Last 30 days
          </button>
        </fieldset>
        {filterError && (
          <p role="alert" className="lp-admin-error">
            {filterError}
          </p>
        )}
        <p className="lp-admin-caption">
          All times use Asia/Seoul (KST). Dashboard uses paid date. Orders use
          creation date. Buying groups and Activity show all dates and payment
          modes.
        </p>
        {error && (
          <div role="alert" className="lp-admin-error">
            {error}{' '}
            <button disabled={busy || loading} onClick={reload}>
              Retry / reload latest
            </button>
          </div>
        )}
        {notice && (
          <p role="status" className="lp-admin-notice">
            {notice}
          </p>
        )}
        {loading ? (
          <p role="status">Loading complete operational data…</p>
        ) : (
          data &&
          !error && (
            <>
              <p className="lp-admin-caption">
                Updated {date(data.generatedAt)} KST · {data.orders.length}{' '}
                orders · {data.groups.length} buying groups
              </p>
              {data.setupRequired && (
                <p role="alert" className="lp-admin-error">
                  Activity storage is not set up. Live data is available;
                  administrator notes, flags and archive actions are disabled
                  until the operations migration is applied.
                </p>
              )}
              {tab === 'Dashboard' && (
                <>
                  <div className="lp-admin-metrics">
                    {[
                      ['Paid order amount', money(data.revenue.amount)],
                      ['Paid orders', data.revenue.orders],
                      ['Average paid order', money(data.revenue.average)],
                      ['Refund amount', 'Not connected'],
                    ].map(([label, value]) => (
                      <article key={label}>
                        <span>
                          {label} · {modeLabel(mode)}
                        </span>
                        <strong>{value}</strong>
                      </article>
                    ))}
                  </div>
                  <p className="lp-admin-caption">
                    {data.revenue.basis} These are recorded order amounts, not
                    provider-verified settlement. Archived orders remain in
                    totals.
                  </p>
                  <div className="lp-ops-split">
                    <section>
                      <h3>Daily paid order amount</h3>
                      <p className="lp-admin-caption">
                        Previous same-length period:{' '}
                        {money(data.previousRevenue.amount)} ·{' '}
                        {data.previousRevenue.orders} paid orders.{' '}
                        {data.previousRevenue.amount > 0
                          ? `${((data.revenue.amount / data.previousRevenue.amount - 1) * 100).toFixed(1)}% change in recorded amount.`
                          : 'Percentage change is unavailable when the previous amount is zero.'}
                      </p>
                      <p>
                        {from} — {to} · {modeLabel(mode)}
                      </p>
                      <div
                        className="lp-ops-chart"
                        role="img"
                        aria-label={`Daily recorded paid order amount: ${money(data.revenue.amount)} across ${data.revenue.orders} orders. Exact daily values are available in the table below.`}
                      >
                        {data.revenue.daily.map((point) => (
                          <div
                            key={point.day}
                            className="lp-ops-bar"
                            title={`${point.day}: ${money(point.amount)} · ${point.orders} orders`}
                          >
                            <span
                              style={{
                                height: `${Math.max(0, (point.amount / Math.max(1, ...data.revenue.daily.map((p) => p.amount))) * 100)}%`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <details>
                        <summary>View daily values</summary>
                        <div className="lp-ops-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Paid orders</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.revenue.daily.map((p) => (
                                <tr key={p.day}>
                                  <td>{p.day}</td>
                                  <td>{money(p.amount)}</td>
                                  <td>{p.orders}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </section>
                    <section>
                      <h3>Keep payment modes separate</h3>
                      {Object.entries(data.revenue.breakdown).map(
                        ([key, amount]) => (
                          <p key={key}>
                            <strong>{modeLabel(key)}</strong> ·{' '}
                            {money(amount.amount)} · {amount.orders} paid orders
                          </p>
                        ),
                      )}
                      <p className="lp-admin-caption">
                        Missing or unfamiliar payment modes are unclassified.
                        Test and unclassified orders are never added to Live
                        totals.
                      </p>
                      {data.revenue.invalidPaidOrders > 0 && (
                        <p role="alert">
                          {data.revenue.invalidPaidOrders} paid records have
                          missing or invalid dates/amounts and are not included.
                        </p>
                      )}
                    </section>
                  </div>
                  <h3>Needs attention · all dates / modes</h3>
                  <div className="lp-ops-attention">
                    <button
                      onClick={() => {
                        navigate('Orders');
                        setStatus('pending');
                      }}
                    >
                      Pending orders{' '}
                      <strong>{data.attention.pendingOrders}</strong>
                      <small>
                        Choose a payment mode and order date range to
                        investigate.
                      </small>
                    </button>
                    <button
                      onClick={() => {
                        navigate('Buying Groups');
                        setStatus('due-soon');
                      }}
                    >
                      Groups due within 24h{' '}
                      <strong>{data.attention.dueSoon}</strong>
                    </button>
                    <button
                      onClick={() => {
                        navigate('Buying Groups');
                        setStatus('overdue');
                      }}
                    >
                      Groups past deadline{' '}
                      <strong>{data.attention.overdue}</strong>
                    </button>
                    <article>
                      Participant records needing refund review{' '}
                      <strong>{data.attention.refundRequired}</strong>
                      <small>
                        A flag is not confirmation that a refund was issued.
                      </small>
                    </article>
                  </div>
                </>
              )}
              {tab !== 'Dashboard' && (
                <>
                  <fieldset className="lp-ops-filters" disabled={busy}>
                    <legend>Find records</legend>
                    <label>
                      Search
                      <input
                        value={query}
                        onChange={(e) => {
                          setListPage(1);
                          setQuery(e.target.value);
                        }}
                        placeholder={
                          tab === 'Buying Groups'
                            ? 'Group ID, number or product'
                            : tab === 'Activity'
                              ? 'Record ID or note'
                              : 'Order ID'
                        }
                      />
                    </label>
                    {tab === 'Activity' ? (
                      <>
                        <label>
                          Record type
                          <select
                            value={activityKind}
                            onChange={(e) => {
                              setActivityKind(e.target.value);
                              setListPage(1);
                            }}
                          >
                            <option value="all">All</option>
                            <option value="order">Order</option>
                            <option value="pod">Buying group</option>
                          </select>
                        </label>
                        <label>
                          Action
                          <select
                            value={activityAction}
                            onChange={(e) => {
                              setActivityAction(e.target.value);
                              setListPage(1);
                            }}
                          >
                            <option value="all">All</option>
                            {[
                              'note',
                              'flag',
                              'resolve',
                              'archive',
                              'restore',
                            ].map((a) => (
                              <option key={a}>{a}</option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          Status
                          <select
                            value={status}
                            onChange={(e) => {
                              setListPage(1);
                              setStatus(e.target.value);
                            }}
                          >
                            <option value="all">All statuses</option>
                            {(tab === 'Orders'
                              ? [
                                  ...new Set(
                                    data.orders.map(
                                      (o) => o.status ?? 'Unknown',
                                    ),
                                  ),
                                ]
                              : [
                                  'due-soon',
                                  'overdue',
                                  ...new Set(
                                    data.groups.map(
                                      (g) => g.status ?? 'Unknown',
                                    ),
                                  ),
                                ]
                            ).map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Archive
                          <select
                            value={archive}
                            onChange={(e) => {
                              setListPage(1);
                              setArchive(e.target.value);
                            }}
                          >
                            <option value="active">Active records</option>
                            <option value="archived">Archived records</option>
                            <option value="all">All records</option>
                          </select>
                        </label>
                        <label className="lp-admin-check">
                          <input
                            type="checkbox"
                            checked={reviewOnly}
                            onChange={(e) => {
                              setListPage(1);
                              setReviewOnly(e.target.checked);
                            }}
                          />
                          Needs review only
                        </label>
                      </>
                    )}
                  </fieldset>
                  <p>
                    {listCount} matching records · page {safePage} of{' '}
                    {totalPages}
                  </p>
                  {tab === 'Orders' && (
                    <div className="lp-ops-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Created (KST)</th>
                            <th>Payment status</th>
                            <th>Mode</th>
                            <th>Total</th>
                            <th>Review</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleOrders
                            .slice(start, start + 25)
                            .map((order) => (
                              <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{date(order.created_at)}</td>
                                <td>{order.status ?? 'Unknown'}</td>
                                <td>
                                  {modeLabel(paymentMode(order.payment_mode))}
                                </td>
                                <td>
                                  {order.total === null
                                    ? 'Not recorded'
                                    : money(order.total)}
                                </td>
                                <td>
                                  {order.review
                                    ? 'Needs review'
                                    : order.archived
                                      ? 'Archived'
                                      : '—'}
                                </td>
                                <td>
                                  <button
                                    className="lp-admin-button"
                                    disabled={busy}
                                    onClick={() => select('order', order.id)}
                                  >
                                    View order
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {tab === 'Buying Groups' && (
                    <div className="lp-ops-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Buying group</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Active / capacity</th>
                            <th>Paid records</th>
                            <th>Next deadline (KST)</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleGroups
                            .slice(start, start + 25)
                            .map((group) => (
                              <tr key={group.id}>
                                <td>
                                  #{group.pod_no ?? '—'}
                                  <small>{group.id}</small>
                                  {group.review && (
                                    <span className="lp-ops-badge">
                                      Needs review
                                    </span>
                                  )}
                                </td>
                                <td>{foodLabel(group.productName)}</td>
                                <td>
                                  {group.status}
                                  {group.overdue && (
                                    <span className="lp-ops-badge">
                                      Past deadline
                                    </span>
                                  )}
                                  {group.dueSoon && (
                                    <span className="lp-ops-badge">
                                      Due soon
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {group.activeCount} / {group.capacity ?? '—'}
                                </td>
                                <td>{group.paidCount}</td>
                                <td>
                                  {date(
                                    group.status === 'recruiting'
                                      ? group.recruit_deadline
                                      : group.status === 'matched'
                                        ? group.payment_due_at
                                        : null,
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="lp-admin-button"
                                    disabled={busy}
                                    onClick={() => select('pod', group.id)}
                                  >
                                    View group
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {tab === 'Activity' && (
                    <>
                      <p className="lp-admin-caption">
                        Administrator operations recorded in this workspace
                        only. Earlier product and taste changes are not
                        backfilled. Actor IDs are retained server-side for
                        audit.
                      </p>
                      {visibleActivity.slice(start, start + 25).map((e) => (
                        <article className="lp-ops-activity" key={e.id}>
                          <div>
                            <strong>
                              {e.entity_kind === 'pod'
                                ? 'Buying group'
                                : 'Order'}{' '}
                              · {e.entity_id}
                            </strong>
                            <span className="lp-ops-badge">{e.action}</span>
                            <time>{date(e.created_at)} KST</time>
                          </div>
                          <p>{e.note}</p>
                          <button
                            disabled={busy}
                            onClick={() => select(e.entity_kind, e.entity_id)}
                          >
                            Open record
                          </button>
                        </article>
                      ))}
                    </>
                  )}
                  {!listCount && <p>No records match these filters.</p>}
                  <div className="lp-ops-pagination">
                    <button
                      disabled={safePage <= 1 || busy}
                      onClick={() => setListPage(safePage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      disabled={safePage >= totalPages || busy}
                      onClick={() => setListPage(safePage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )
        )}
        {selected && (
          <section
            className="lp-ops-detail"
            ref={detailPanel}
            tabIndex={-1}
            aria-label="Selected record details"
          >
            <div className="lp-ops-toolbar">
              <h3>
                {selected.kind === 'order'
                  ? 'Order details'
                  : 'Buying group details'}
              </h3>
              <button
                disabled={busy}
                onClick={() => {
                  detailVersion.current++;
                  setSelected(null);
                }}
              >
                Close details
              </button>
            </div>
            <p className="lp-ops-id">{selected.id}</p>
            {detailLoading && selected.kind === 'order' && (
              <p role="status">Loading order details…</p>
            )}
            {detailError && selected.kind === 'order' && (
              <p role="alert">
                {detailError}{' '}
                <button
                  onClick={() => {
                    setDetailError('');
                    setDetailLoading(true);
                    setSelected({ ...selected });
                  }}
                >
                  Retry details
                </button>
              </p>
            )}
            {selected.kind === 'order' && detail?.order.id === selected.id && (
              <>
                <div className="lp-ops-split">
                  <section>
                    <h4>Payment & amounts</h4>
                    <dl>
                      <dt>Status</dt>
                      <dd>
                        {detail.order.status ?? 'Unknown'} ·{' '}
                        {modeLabel(paymentMode(detail.order.payment_mode))}
                      </dd>
                      <dt>Subtotal</dt>
                      <dd>
                        {detail.order.subtotal === null
                          ? 'Not recorded'
                          : money(detail.order.subtotal)}
                      </dd>
                      <dt>Shipping</dt>
                      <dd>
                        {detail.order.shipping_fee === null
                          ? 'Not recorded'
                          : money(detail.order.shipping_fee)}
                      </dd>
                      <dt>Discount</dt>
                      <dd>
                        {detail.order.discount === null
                          ? 'Not recorded'
                          : money(detail.order.discount)}
                      </dd>
                      <dt>Total</dt>
                      <dd>
                        {detail.order.total === null
                          ? 'Not recorded'
                          : money(detail.order.total)}
                      </dd>
                      <dt>Payment method</dt>
                      <dd>{detail.order.payment_method ?? 'Not recorded'}</dd>
                    </dl>
                  </section>
                  <section>
                    <h4>Delivery</h4>
                    <p>
                      {detail.order.recipient_name ?? 'Not recorded'} ·{' '}
                      {detail.order.recipient_phone ?? 'No phone'}
                    </p>
                    <p>
                      {detail.order.postal_code}{' '}
                      {detail.order.recipient_address}{' '}
                      {detail.order.recipient_address_detail}
                    </p>
                    <p className="lp-admin-caption">
                      For fulfilment review. Phone numbers are masked.
                    </p>
                  </section>
                </div>
                <h4>Ordered items</h4>
                {detail.items.length ? (
                  <ul>
                    {detail.items.map((item) => (
                      <li key={item.id}>
                        {foodLabel(item.product_name ?? 'Product unavailable')}{' '}
                        ·{' '}
                        {foodLabel(
                          item.portion_label ?? 'Portion not recorded',
                        )}{' '}
                        ·{' '}
                        {item.unit_price === null
                          ? 'Not recorded'
                          : money(item.unit_price)}
                        {item.pod_id && (
                          <button
                            disabled={busy}
                            onClick={() => select('pod', item.pod_id!)}
                          >
                            View linked buying group
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No item snapshots were recorded.</p>
                )}
                <h4>Recorded lifecycle</h4>
                <p>Created: {date(detail.order.created_at)} KST</p>
                <p>Paid: {date(detail.order.paid_at)} KST</p>
              </>
            )}
            {selected.kind === 'pod' && selectedGroup && (
              <>
                <h4>
                  {foodLabel(selectedGroup.productName)} · #
                  {selectedGroup.pod_no ?? '—'}
                </h4>
                <p>
                  Status: {selectedGroup.status} · Active participants:{' '}
                  {selectedGroup.activeCount} / {selectedGroup.capacity ?? '—'}
                </p>
                <p>
                  Stored member count:{' '}
                  {selectedGroup.member_count ?? 'Not recorded'} · Paid records:{' '}
                  {selectedGroup.paidCount} · Payment-ready:{' '}
                  {selectedGroup.paymentReady}
                </p>
                <p>
                  Recruitment deadline: {date(selectedGroup.recruit_deadline)}{' '}
                  KST
                </p>
                <p>
                  Payment deadline: {date(selectedGroup.payment_due_at)} KST
                </p>
                <p>
                  Matched: {date(selectedGroup.matched_at)} KST · Confirmed:{' '}
                  {date(selectedGroup.confirmed_at)} KST
                </p>
                <p>
                  Cancelled: {date(selectedGroup.cancelled_at)} KST ·{' '}
                  {selectedGroup.cancel_reason ?? 'No recorded reason'}
                </p>
                {selectedGroup.refundRequired > 0 && (
                  <p role="alert">
                    {selectedGroup.refundRequired} participant records require
                    refund review.
                  </p>
                )}
                <h4>Linked orders</h4>
                {selectedGroup.orderIds.length ? (
                  <ul>
                    {selectedGroup.orderIds.map((id) => (
                      <li key={id}>
                        <button
                          disabled={busy}
                          onClick={() => select('order', id)}
                        >
                          {id}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No linked order snapshots recorded.</p>
                )}
              </>
            )}
            <h4>Administrator activity</h4>
            <Timeline events={events} />
            <form onSubmit={saveOperation}>
              <fieldset
                disabled={
                  busy ||
                  !currentState ||
                  data?.setupRequired ||
                  loading ||
                  !!detailError
                }
                className="lp-ops-action"
              >
                <legend>Record an operation</legend>
                <label>
                  Action
                  <select
                    value={action}
                    onChange={(e) =>
                      setAction(e.target.value as OperationEvent['action'])
                    }
                  >
                    <option value="note">Add internal note</option>
                    <option value="flag">Flag for review</option>
                    <option value="resolve">Resolve review flag</option>
                    <option value="archive">Archive from active lists</option>
                    <option value="restore">Restore to active lists</option>
                  </select>
                </label>
                <label>
                  Reason / internal note
                  <textarea
                    value={note}
                    maxLength={1000}
                    required
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe the check or reason. Do not enter passwords or payment credentials."
                  />
                </label>
                <p>
                  Archiving only organises the workspace. It does not cancel an
                  order, refund a payment, close a buying group or remove sales
                  from reports.
                </p>
                <button className="lp-admin-button" type="submit">
                  {busy ? 'Recording…' : 'Record operation'}
                </button>
              </fieldset>
            </form>
          </section>
        )}
      </section>
    </div>
  );
}
