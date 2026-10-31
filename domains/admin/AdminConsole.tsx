'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { foodLabel } from '@/shared/lib/food-label';
import {
  configurableProducts,
  ELEMENTS,
  defaultTasteConfig,
  type TasteConfig,
} from './taste-config';
import { recommendConfigured } from './recommend';
import type { TasteSettings, adminProducts, adminOrders } from './admin.server';

type Products = Awaited<ReturnType<typeof adminProducts>>;
type Orders = Awaited<ReturnType<typeof adminOrders>>;
type Summary = { products: number; orders: number; tasteProfiles: number };
const navigation = [
  'Overview',
  'Products',
  'Orders',
  'Taste Finder',
  'Settings',
] as const;
const sections = [
  'Questions',
  'Result profiles',
  'Matching rules',
  'Recommendations',
  'Preview & publish',
  'History',
] as const;
const labels: Record<string, string> = {
  sunday: 'Sunday morning',
  fridge: 'Your fridge',
  title: 'Title',
  description: 'Description',
  copy: 'Result description',
  choices: 'Choices',
  b: 'Brunch',
  p: 'Picnic',
  n: 'Snacks',
  c: 'Cooking',
  empty: 'Almost empty',
  sauce: 'Sauces',
  banchan: 'Side dishes',
  wilted: 'Use vegetables first',
  목: 'Wood',
  화: 'Fire',
  토: 'Earth',
  금: 'Metal',
  수: 'Water',
  elementWeight: 'Element match',
  sundayWeight: 'Sunday scene match',
  kitElementBonus: 'Extra meal-kit element match',
};
async function api<T>(
  path: string,
  body?: unknown,
  method = 'PUT',
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch('/api/admin/' + path, {
    method: body === undefined ? 'GET' : method,
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
    ...(body === undefined
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error?.message ?? 'The request could not be completed.',
    );
  return result.data as T;
}
function Fields({
  value,
  path = [],
  onChange,
}: {
  value: Record<string, unknown>;
  path?: string[];
  onChange: (path: string[], value: string | number) => void;
}) {
  return (
    <>
      {Object.entries(value).map(([key, item]) => {
        const next = [...path, key];
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return (
            <fieldset key={key} className="lp-admin-fieldset">
              <legend>{labels[key] ?? key}</legend>
              <Fields
                value={item as Record<string, unknown>}
                path={next}
                onChange={onChange}
              />
            </fieldset>
          );
        }
        return (
          <label className="lp-admin-field" key={key}>
            <span>{labels[key] ?? key}</span>
            {typeof item === 'number' ? (
              <input
                type="number"
                min="0"
                max="10"
                step="1"
                value={item}
                onChange={(event) => onChange(next, Number(event.target.value))}
              />
            ) : (
              <textarea
                rows={key === 'copy' ? 3 : 2}
                maxLength={
                  key === 'copy' ? 500 : key === 'description' ? 200 : 200
                }
                value={String(item)}
                onChange={(event) => onChange(next, event.target.value)}
              />
            )}
          </label>
        );
      })}
    </>
  );
}
function TastePreview({ config }: { config: TasteConfig }) {
  const [year, setYear] = useState(1990);
  const [sunday, setSunday] = useState<'b' | 'p' | 'n' | 'c'>('b');
  const [fridge, setFridge] = useState<
    'empty' | 'sauce' | 'banchan' | 'wilted'
  >('empty');
  const result = recommendConfigured(
    { nick: 'Preview', y: year, m: 6, d: 15, g: 'n', sun: sunday, fridge },
    config,
  );
  const profile = config.profiles[result.z.el as keyof typeof config.profiles];
  return (
    <div className="lp-admin-preview">
      <h3>Try the current draft</h3>
      <p>
        Uses a fictional birthday of June 15 in the selected year. No profile is
        saved.
      </p>
      <div className="lp-admin-input-grid">
        <label className="lp-admin-field">
          Birth year
          <input
            type="number"
            min="1920"
            max="2026"
            value={year}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value >= 1920 && value <= 2026) setYear(value);
            }}
          />
        </label>
        <label className="lp-admin-field">
          Sunday scene
          <select
            value={sunday}
            onChange={(event) => setSunday(event.target.value as typeof sunday)}
          >
            {Object.entries(config.questions.sunday.choices).map(
              ([key, item]) => (
                <option key={key} value={key}>
                  {item.title}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="lp-admin-field">
          Fridge
          <select
            value={fridge}
            onChange={(event) => setFridge(event.target.value as typeof fridge)}
          >
            {Object.entries(config.questions.fridge.choices).map(
              ([key, item]) => (
                <option key={key} value={key}>
                  {item.title}
                </option>
              ),
            )}
          </select>
        </label>
      </div>
      <div className="lp-admin-result">
        <p className="lp-admin-eyebrow">RESULT PREVIEW</p>
        <h3>{profile.title}</h3>
        <p>{profile.copy}</p>
        <ul>
          {[...result.items, result.kit].map((item: string[]) => (
            <li key={item[0]}>{foodLabel(item[0])}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AdminConsole() {
  const [page, setPage] = useState<(typeof navigation)[number]>('Overview');
  const [tab, setTab] = useState<(typeof sections)[number]>('Questions');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<Products>([]);
  const [orders, setOrders] = useState<Orders>([]);
  const [settings, setSettings] = useState<TasteSettings | null>(null);
  const [draft, setDraft] = useState<TasteConfig>(
    structuredClone(defaultTasteConfig),
  );
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async (signal?: AbortSignal) => {
    const [nextSummary, nextProducts, nextOrders, nextSettings] =
      await Promise.all([
        api<Summary>('summary', undefined, 'GET', signal),
        api<Products>('products', undefined, 'GET', signal),
        api<Orders>('orders', undefined, 'GET', signal),
        api<TasteSettings>('taste', undefined, 'GET', signal),
      ]);
    return { nextSummary, nextProducts, nextOrders, nextSettings };
  }, []);
  const applyLoadedData = useCallback(
    (data: Awaited<ReturnType<typeof load>>) => {
      setSummary(data.nextSummary);
      setProducts(data.nextProducts);
      setOrders(data.nextOrders);
      setSettings(data.nextSettings);
      setDraft(structuredClone(data.nextSettings.draft));
      setDirty(false);
    },
    [],
  );
  useEffect(() => {
    const abort = new AbortController();
    load(abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) applyLoadedData(data);
      })
      .catch((error) => {
        if (!abort.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [load, applyLoadedData]);
  function edit(path: string[], value: string | number) {
    setDraft((current) => {
      const next = structuredClone(current);
      let target = next as unknown as Record<string, unknown>;
      for (const part of path.slice(0, -1))
        target = target[part] as Record<string, unknown>;
      target[path.at(-1)!] = value;
      return next;
    });
    setDirty(true);
    setNotice('');
  }
  async function changeTaste(
    action: 'save' | 'publish' | 'restore',
    targetRevision?: number,
  ) {
    if (!settings) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const next = await api<TasteSettings>('taste', {
        action,
        revision: settings.revision,
        ...(action === 'save' ? { config: draft } : {}),
        ...(targetRevision === undefined ? {} : { targetRevision }),
      });
      setSettings(next);
      setDraft(structuredClone(next.draft));
      setDirty(false);
      setNotice(
        action === 'save'
          ? 'Draft saved. The live experience is unchanged.'
          : action === 'publish'
            ? 'Published. New taste sessions will use this version.'
            : 'Version restored as a draft. Review it before publishing.',
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not save settings.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function saveProduct(
    event: React.FormEvent<HTMLFormElement>,
    product: Products[number],
  ) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      await api(
        'products/' + encodeURIComponent(product.id),
        {
          price: Number(form.get('price')),
          active: form.get('active') === 'on',
          updatedAt: product.updatedAt,
        },
        'PATCH',
      );
      setProducts(await api<Products>('products'));
      setNotice(
        'Product saved. Existing storefront reads use the updated database values.',
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not save product.',
      );
    } finally {
      setBusy(false);
    }
  }
  const filtered = products.filter((product) =>
    [
      product.name ?? '',
      product.id,
      product.catalogId ?? '',
      foodLabel(product.name ?? ''),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="lp-admin">
      <header className="lp-admin-masthead">
        <div>
          <p className="lp-admin-eyebrow">LITTLE PORTIONS / BACK OFFICE</p>
          <h1>A little more care.</h1>
          <p>Products, preferences, and the work behind every order.</p>
        </div>
        <Link href="/" className="lp-admin-text-link">
          View the shop ↗
        </Link>
      </header>
      <div className="lp-admin-shell">
        <nav className="lp-admin-nav" aria-label="Administrator navigation">
          {navigation.map((item) => (
            <button
              key={item}
              aria-pressed={page === item}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <main className="lp-admin-workspace" aria-busy={loading || busy}>
          <div className="lp-admin-heading">
            <h2>{page}</h2>
            <span className="lp-admin-badge">Administrator</span>
          </div>
          {error && (
            <div role="alert" className="lp-admin-error">
              {error}
              {loading === false && !summary && (
                <button
                  disabled={busy}
                  onClick={() => {
                    setLoading(true);
                    setError('');
                    load()
                      .then(applyLoadedData)
                      .catch((error) => setError(error.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  Retry loading
                </button>
              )}
            </div>
          )}
          {notice && (
            <p role="status" className="lp-admin-notice">
              {notice}
            </p>
          )}
          <fieldset
            disabled={busy}
            className="lp-admin-controls"
            aria-label="Administrator controls"
          >
            {loading ? (
              <p role="status">Loading operational data…</p>
            ) : (
              <>
                {page === 'Overview' && summary && (
                  <>
                    <p>Current totals from the connected database.</p>
                    <div className="lp-admin-metrics">
                      {[
                        ['Products', summary.products],
                        ['Orders', summary.orders],
                        ['Saved taste profiles', summary.tasteProfiles],
                      ].map(([label, count]) => (
                        <article key={label}>
                          <span>{label}</span>
                          <strong>{count}</strong>
                        </article>
                      ))}
                    </div>
                    <div className="lp-admin-note">
                      <h3>Start with what needs your attention.</h3>
                      <p>
                        Manage sale availability and pricing in Products.
                        Prepare taste changes as a draft, test them, and publish
                        when ready.
                      </p>
                      <p>
                        Order processing and payment refunds remain in the
                        existing workflow.
                      </p>
                    </div>
                  </>
                )}
                {page === 'Products' && (
                  <>
                    <p>
                      Prices and sale availability are read from Supabase. Stock
                      quantities are not tracked by the current product schema.
                    </p>
                    <label className="lp-admin-field">
                      Search products
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Name or product ID"
                      />
                    </label>
                    <p className="lp-admin-caption">
                      {filtered.length} of {products.length} loaded products
                      (maximum 200).
                    </p>
                    <div className="lp-admin-product-list">
                      {filtered.map((product) => (
                        <form
                          key={product.id + product.updatedAt}
                          className="lp-admin-product"
                          onSubmit={(event) => saveProduct(event, product)}
                        >
                          <div>
                            <h3>{foodLabel(product.name ?? product.id)}</h3>
                            <p className="lp-admin-caption">
                              {product.catalogId ?? product.id} ·{' '}
                              {product.portionLabel
                                ? foodLabel(product.portionLabel)
                                : 'Portion not set'}
                            </p>
                          </div>
                          <label className="lp-admin-field">
                            Price (KRW)
                            <input
                              required
                              name="price"
                              type="number"
                              min="1"
                              max="100000000"
                              step="1"
                              defaultValue={product.price ?? ''}
                            />
                          </label>
                          <label className="lp-admin-check">
                            <input
                              type="checkbox"
                              name="active"
                              defaultChecked={product.active ?? false}
                            />{' '}
                            On sale
                          </label>
                          <button disabled={busy} className="lp-admin-button">
                            Save product
                          </button>
                        </form>
                      ))}
                    </div>
                    {!filtered.length && <p>No matching products.</p>}
                  </>
                )}
                {page === 'Orders' && (
                  <>
                    <p>
                      Latest {orders.length} orders (maximum 100). This view
                      excludes customer contact and delivery details.
                    </p>
                    <div className="lp-admin-order-list">
                      {orders.map((order) => (
                        <article className="lp-admin-order" key={order.id}>
                          <strong>{order.id}</strong>
                          <span>{order.status ?? 'No status'}</span>
                          <span>{(order.total ?? 0).toLocaleString()} KRW</span>
                          <time>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleString(
                                  'en-GB',
                                )
                              : 'Date not recorded'}
                          </time>
                        </article>
                      ))}
                    </div>
                    {!orders.length && <p>No orders yet.</p>}
                    <p className="lp-admin-caption">
                      Read-only. Updating a label must not be mistaken for
                      cancelling or refunding a payment.
                    </p>
                  </>
                )}
                {page === 'Taste Finder' && settings && (
                  <>
                    <div className="lp-admin-version">
                      <span>Draft revision {settings.revision}</span>
                      <span>
                        Live{' '}
                        {settings.publishedRevision === null
                          ? 'default experience'
                          : 'revision ' + settings.publishedRevision}
                      </span>
                      {dirty && <span>Unsaved changes</span>}
                    </div>
                    {settings.setupRequired && (
                      <p role="status" className="lp-admin-error">
                        Database setup is required before saving or publishing.
                        You can explore and preview the default configuration.
                      </p>
                    )}
                    <nav
                      className="lp-admin-tabs"
                      aria-label="Taste Finder sections"
                    >
                      {sections.map((item) => (
                        <button
                          key={item}
                          aria-pressed={tab === item}
                          onClick={() => setTab(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </nav>
                    {tab === 'Questions' && (
                      <Fields
                        value={draft.questions}
                        path={['questions']}
                        onChange={edit}
                      />
                    )}
                    {tab === 'Result profiles' && (
                      <Fields
                        value={draft.profiles}
                        path={['profiles']}
                        onChange={edit}
                      />
                    )}
                    {tab === 'Matching rules' && (
                      <>
                        <p>
                          Weights range from 0 to 10. Fridge exclusions remain
                          enforced, including when products are explicitly
                          preferred.
                        </p>
                        <Fields
                          value={draft.rules}
                          path={['rules']}
                          onChange={edit}
                        />
                      </>
                    )}
                    {tab === 'Recommendations' && (
                      <>
                        <p>
                          Prefer up to three ingredients and one meal kit per
                          profile. Leave a slot empty to use the matching
                          engine. Unavailable products cannot be published.
                        </p>
                        {ELEMENTS.map((code) => (
                          <fieldset key={code} className="lp-admin-fieldset">
                            <legend>{labels[code]}</legend>
                            {[0, 1, 2, 3].map((index) => (
                              <label className="lp-admin-field" key={index}>
                                Preferred product {index + 1}
                                <select
                                  value={
                                    draft.recommendations[code][index] ?? ''
                                  }
                                  onChange={(event) => {
                                    const id = event.target.value;
                                    setDraft((current) => {
                                      const next = structuredClone(current);
                                      const ids = [
                                        ...next.recommendations[code],
                                      ];
                                      if (id) ids[index] = id;
                                      else ids.splice(index, 1);
                                      next.recommendations[code] =
                                        ids.filter(Boolean);
                                      return next;
                                    });
                                    setDirty(true);
                                  }}
                                >
                                  <option value="">Automatic matching</option>
                                  {configurableProducts.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {foodLabel(product.name)}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ))}
                          </fieldset>
                        ))}
                      </>
                    )}
                    {tab === 'Preview & publish' && (
                      <>
                        <TastePreview config={draft} />
                        <div className="lp-admin-note">
                          <h3>Publish the saved draft</h3>
                          <p>
                            Save changes first. Publishing affects new sessions;
                            sessions already in progress keep their loaded
                            version.
                          </p>
                          <button
                            className="lp-admin-button"
                            disabled={busy || dirty || settings.setupRequired}
                            onClick={() => changeTaste('publish')}
                          >
                            Publish saved draft
                          </button>
                        </div>
                      </>
                    )}
                    {tab === 'History' && (
                      <>
                        <p>
                          Up to 10 published versions are retained. Restoring
                          creates a draft and does not immediately change the
                          live experience.
                        </p>
                        {settings.history.map((item) => (
                          <article
                            key={item.revision}
                            className="lp-admin-order"
                          >
                            <strong>Revision {item.revision}</strong>
                            <time>
                              {new Date(item.publishedAt).toLocaleString(
                                'en-GB',
                              )}
                            </time>
                            <button
                              className="lp-admin-button-secondary"
                              disabled={busy || dirty}
                              onClick={() =>
                                changeTaste('restore', item.revision)
                              }
                            >
                              Restore as draft
                            </button>
                          </article>
                        ))}
                        {!settings.history.length && (
                          <p>No published versions yet.</p>
                        )}
                      </>
                    )}
                    <div className="lp-admin-actions">
                      <span>
                        {dirty
                          ? 'Your edits are not saved yet.'
                          : 'Draft is up to date.'}
                      </span>
                      <button
                        className="lp-admin-button"
                        disabled={busy || !dirty || settings.setupRequired}
                        onClick={() => changeTaste('save')}
                      >
                        {busy ? 'Working…' : 'Save draft'}
                      </button>
                    </div>
                  </>
                )}
                {page === 'Settings' && (
                  <div className="lp-admin-note">
                    <h3>Access & boundaries</h3>
                    <p>
                      Access requires an Auth-verified email on the server
                      allowlist. Change the administrator list in server
                      environment settings and restart the service.
                    </p>
                    <p>
                      Secret keys and credentials are never shown in this
                      console.
                    </p>
                    <p>
                      Content publishing, customer support, quantity-based
                      inventory, and payment actions are outside this first
                      release.
                    </p>
                  </div>
                )}
              </>
            )}
          </fieldset>
        </main>
      </div>
    </div>
  );
}
