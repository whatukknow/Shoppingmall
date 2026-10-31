import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/lib/supabase/database.types';
import {
  AdminError,
  adminNavigationHref,
  assertSameOrigin,
  isAdmin,
  readAdminJson,
} from '../../domains/admin/access';
import {
  defaultTasteConfig,
  parseTasteConfig,
} from '../../domains/admin/taste-config';
import { recommendConfigured } from '../../domains/admin/recommend';
import { recommend } from '../../domains/home/onboarding/react/recommendation';
import type { TasteAnswers } from '../../domains/home/onboarding/react/answers';

process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= 'synthetic-key';
import {
  requireAdmin,
  readTasteSettings,
  publishedTasteConfig,
  changeTasteSettings,
  parseProductPatch,
  updateAdminProduct,
  adminFailure,
} from '../../domains/admin/admin.server';

const user = {
  id: 'synthetic-admin',
  email: 'operator@example.test',
  email_confirmed_at: '2026-01-01T00:00:00Z',
};
type Result = { data: unknown; error: { code: string } | null; count?: number };
function fakeClient(
  results: Result[],
  calls: { table: string; operation: string; value?: unknown }[] = [],
) {
  return {
    from(table: string) {
      const next = results.shift();
      if (!next) throw new Error('Unexpected database access: ' + table);
      const builder = {
        select(value: unknown) {
          calls.push({ table, operation: 'select', value });
          return builder;
        },
        update(value: unknown) {
          calls.push({ table, operation: 'update', value });
          return builder;
        },
        eq(key: string, value: unknown) {
          calls.push({ table, operation: 'eq:' + key, value });
          return builder;
        },
        is(key: string, value: unknown) {
          calls.push({ table, operation: 'is:' + key, value });
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle: async () => next,
        then(resolve: (value: Result) => unknown) {
          return Promise.resolve(resolve(next));
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
}
const ok = (data: unknown): Result => ({ data, error: null });
const row = () => ({
  id: 'current',
  revision: 4,
  draft: structuredClone(defaultTasteConfig),
  published: structuredClone(defaultTasteConfig),
  published_revision: 2,
  history: [],
});
const hasStatus = (status: number) => (error: unknown) =>
  error instanceof AdminError && error.status === status;

describe('admin identity and request boundaries', () => {
  it('offers the admin link only after server authorization succeeds', async () => {
    assert.equal(await adminNavigationHref(async () => user), '/admin');
    assert.equal(
      await adminNavigationHref(async () => {
        throw new AdminError(401, 'No session');
      }),
      undefined,
    );
    assert.equal(
      await adminNavigationHref(async () => {
        throw new AdminError(403, 'Not an admin');
      }),
      undefined,
    );
    assert.equal(
      await adminNavigationHref(async () => {
        throw new Error('Auth unavailable');
      }),
      undefined,
    );
  });
  it('fails closed without a server allowlist and requires a confirmed email', () => {
    assert.equal(isAdmin(user, ''), false);
    assert.equal(isAdmin(null, 'operator@example.test'), false);
    assert.equal(
      isAdmin(
        { ...user, email_confirmed_at: undefined },
        'operator@example.test',
      ),
      false,
    );
    assert.equal(
      isAdmin(
        { ...user, email: 'attacker@example.test' },
        'operator@example.test',
      ),
      false,
    );
    assert.equal(isAdmin(user, ' OPERATOR@example.test '), true);
  });
  it('does not trust editable user metadata', () => {
    const malicious = {
      ...user,
      email: 'attacker@example.test',
      user_metadata: { role: 'admin', email: 'operator@example.test' },
    };
    assert.equal(isAdmin(malicious, 'operator@example.test'), false);
  });
  it('verifies Auth identity and differentiates missing session from authorization', async () => {
    const auth = (identity: unknown, error: unknown = null) =>
      ({
        auth: { getUser: async () => ({ data: { user: identity }, error }) },
      }) as SupabaseClient<Database>;
    await assert.rejects(requireAdmin(auth(null)), hasStatus(401));
    await assert.rejects(
      requireAdmin(auth({ ...user, email: 'ordinary@example.test' })),
      hasStatus(403),
    );
    await assert.rejects(
      requireAdmin(auth(null, { status: 503 })),
      hasStatus(503),
    );
    const before = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = user.email;
    try {
      assert.equal((await requireAdmin(auth(user))).id, user.id);
    } finally {
      if (before === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = before;
    }
  });
  it('rejects absent/foreign origins and non-JSON writes', () => {
    const request = (origin?: string, type = 'application/json') =>
      new Request('https://shop.example.test/api/admin/taste', {
        headers: { ...(origin ? { origin } : {}), 'content-type': type },
      });
    assert.throws(() => assertSameOrigin(request()), hasStatus(403));
    assert.throws(
      () => assertSameOrigin(request('https://evil.example.test')),
      hasStatus(403),
    );
    assert.throws(
      () =>
        assertSameOrigin(request('https://shop.example.test', 'text/plain')),
      hasStatus(415),
    );
    assert.doesNotThrow(() =>
      assertSameOrigin(request('https://shop.example.test')),
    );
  });
  it('accepts the browser Host when Next normalizes its bind hostname', () => {
    const request = (origin: string) =>
      new Request('http://localhost:3017/api/admin/taste', {
        headers: {
          host: '127.0.0.1:3017',
          origin,
          'content-type': 'application/json',
        },
      });
    assert.doesNotThrow(() =>
      assertSameOrigin(request('http://127.0.0.1:3017')),
    );
    assert.throws(
      () => assertSameOrigin(request('http://evil.test')),
      hasStatus(403),
    );
    assert.throws(
      () => assertSameOrigin(request('http://localhost:3017')),
      hasStatus(403),
    );
  });
  it('bounds actual body bytes and rejects malformed JSON', async () => {
    await assert.rejects(
      readAdminJson(
        new Request('https://shop.test', { method: 'PUT', body: '{' }),
      ),
      hasStatus(400),
    );
    await assert.rejects(
      readAdminJson(
        new Request('https://shop.test', {
          method: 'PUT',
          body: JSON.stringify({ value: 'x'.repeat(65_000) }),
        }),
      ),
      hasStatus(413),
    );
    assert.deepEqual(
      await readAdminJson(
        new Request('https://shop.test', {
          method: 'PUT',
          body: '{"action":"save"}',
        }),
      ),
      { action: 'save' },
    );
  });
  it('does not expose database errors in HTTP responses', async () => {
    const response = adminFailure(new Error('secret database detail'));
    assert.equal(response.status, 500);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.doesNotMatch(
      JSON.stringify(await response.json()),
      /secret database detail/,
    );
  });
});

describe('configuration and recommendation boundaries', () => {
  it('accepts defaults, rejects missing/extra fields, empty text and invalid weights', () => {
    assert.deepEqual(parseTasteConfig(defaultTasteConfig), defaultTasteConfig);
    const bad = structuredClone(defaultTasteConfig);
    bad.questions.sunday.title = '';
    assert.throws(() => parseTasteConfig(bad), hasStatus(400));
    assert.throws(
      () => parseTasteConfig({ ...defaultTasteConfig, injected: true }),
      hasStatus(400),
    );
    assert.throws(
      () =>
        parseTasteConfig({
          ...defaultTasteConfig,
          rules: { ...defaultTasteConfig.rules, elementWeight: 11 },
        }),
      hasStatus(400),
    );
  });
  it('checks catalog identities, duplicates and ingredient/kit cardinality', () => {
    const bad = structuredClone(defaultTasteConfig);
    bad.recommendations.목 = ['raw-999'];
    assert.throws(() => parseTasteConfig(bad), hasStatus(400));
    bad.recommendations.목 = ['raw-01', 'raw-01'];
    assert.throws(() => parseTasteConfig(bad), hasStatus(400));
    bad.recommendations.목 = ['diy-01', 'diy-02'];
    assert.throws(() => parseTasteConfig(bad), hasStatus(400));
    bad.recommendations.목 = ['raw-01', 'diy-01'];
    assert.doesNotThrow(() => parseTasteConfig(bad));
  });
  it('preserves the original matching output across all current answer combinations', () => {
    for (const y of [1981, 1990, 2003, 2014, 2020])
      for (const sun of ['b', 'p', 'n', 'c'] as const)
        for (const fridge of ['empty', 'sauce', 'banchan', 'wilted'] as const) {
          const answers: TasteAnswers = {
            nick: 'Synthetic',
            y,
            m: 6,
            d: 15,
            g: 'n',
            sun,
            fridge,
          };
          assert.deepEqual(
            recommendConfigured(answers, defaultTasteConfig),
            recommend(answers),
          );
        }
  });
  it('applies editorial product preferences while preserving fridge exclusions', () => {
    const config = structuredClone(defaultTasteConfig);
    const answers: TasteAnswers = {
      nick: 'Synthetic',
      y: 1994,
      m: 6,
      d: 15,
      g: 'n',
      sun: 'b',
      fridge: 'empty',
    };
    const code = recommend(answers).z.el as keyof typeof config.recommendations;
    config.recommendations[code] = ['raw-01', 'diy-01'];
    const result = recommendConfigured(answers, config);
    assert.equal(result.items[0][0], '참외');
    assert.equal(result.kit[0], '브리오슈 프렌치토스트');
    config.recommendations[code] = ['raw-10'];
    const excluded = recommendConfigured(
      { ...answers, fridge: 'wilted' },
      config,
    );
    assert.ok(excluded.items.every((item: string[]) => item[4] !== 'v'));
  });
});

describe('service-only persistence and optimistic concurrency', () => {
  it('returns a setup-required default only for a missing table/seed, not generic failures', async () => {
    assert.equal(
      (
        await readTasteSettings(
          fakeClient([{ data: null, error: { code: 'PGRST205' } }]),
        )
      ).setupRequired,
      true,
    );
    await assert.rejects(
      readTasteSettings(fakeClient([{ data: null, error: { code: '42501' } }])),
      hasStatus(503),
    );
    assert.equal(
      (await readTasteSettings(fakeClient([ok(null)]))).setupRequired,
      true,
    );
  });
  it('returns only published configuration to onboarding', async () => {
    const current = row();
    current.draft.questions.sunday.title = 'Private draft';
    const result = await publishedTasteConfig(fakeClient([ok(current)]));
    assert.deepEqual(Object.keys(result).sort(), ['config', 'revision']);
    assert.equal(result.revision, 2);
    assert.notEqual(result.config.questions.sunday.title, 'Private draft');
  });
  it('keeps live configuration unchanged when saving a draft', async () => {
    const current = row(),
      draft = structuredClone(defaultTasteConfig);
    draft.questions.sunday.title = 'Updated question';
    const calls: { table: string; operation: string; value?: unknown }[] = [];
    await changeTasteSettings(
      'synthetic',
      { action: 'save', revision: 4, config: draft },
      fakeClient(
        [
          ok(current),
          ok({ id: 'current' }),
          ok({ ...current, revision: 5, draft }),
        ],
        calls,
      ),
    );
    const update = calls.find((call) => call.operation === 'update')
      ?.value as Record<string, unknown>;
    assert.deepEqual(update.published, current.published);
    assert.equal(
      (update.draft as typeof draft).questions.sunday.title,
      'Updated question',
    );
    assert.ok(
      calls.some(
        (call) => call.operation === 'eq:revision' && call.value === 4,
      ),
    );
  });
  it('rejects stale drafts and conflicting writes', async () => {
    await assert.rejects(
      changeTasteSettings(
        'synthetic',
        { action: 'publish', revision: 3 },
        fakeClient([ok(row())]),
      ),
      hasStatus(409),
    );
    await assert.rejects(
      changeTasteSettings(
        'synthetic',
        { action: 'save', revision: 4, config: defaultTasteConfig },
        fakeClient([ok(row()), ok(null)]),
      ),
      hasStatus(409),
    );
  });
  it('validates active product links before publishing', async () => {
    const current = row();
    current.draft.recommendations.목 = ['raw-01'];
    await assert.rejects(
      changeTasteSettings(
        'synthetic',
        { action: 'publish', revision: 4 },
        fakeClient([
          ok(current),
          ok([
            {
              id: 'raw-01',
              name: '참외',
              is_active: false,
              portion_price: 100,
              details: { catalogId: 'raw-01' },
            },
          ]),
        ]),
      ),
      hasStatus(400),
    );
  });
  it('rejects unreviewed name matches and ambiguous storefront bindings', async () => {
    const current = row();
    current.draft.recommendations.목 = ['raw-13'];
    const unreviewed = {
      id: 'unknown',
      name: '사과',
      is_active: true,
      portion_price: 100,
      details: null,
    };
    await assert.rejects(
      changeTasteSettings(
        'synthetic',
        { action: 'publish', revision: 4 },
        fakeClient([ok(current), ok([unreviewed])]),
      ),
      hasStatus(400),
    );
    const original = { ...unreviewed, id: 'prd_001' };
    const duplicate = {
      ...unreviewed,
      id: 'raw-13',
      details: {
        catalogId: 'raw-13',
        demoPricing: { version: '2026-10-31-v1' },
      },
    };
    await assert.rejects(
      changeTasteSettings(
        'synthetic',
        { action: 'publish', revision: 4 },
        fakeClient([ok(current), ok([original, duplicate])]),
      ),
      hasStatus(400),
    );
  });
  it('publishes a saved draft and adds a bounded version history', async () => {
    const current = row(),
      calls: { table: string; operation: string; value?: unknown }[] = [];
    await changeTasteSettings(
      'synthetic',
      { action: 'publish', revision: 4 },
      fakeClient(
        [ok(current), ok({ id: 'current' }), ok({ ...current, revision: 5 })],
        calls,
      ),
    );
    const update = calls.find((call) => call.operation === 'update')
      ?.value as Record<string, unknown>;
    assert.equal(update.published_revision, 5);
    assert.deepEqual(update.published, current.draft);
    assert.equal((update.history as unknown[]).length, 1);
  });
  it('restores a historical configuration into draft only', async () => {
    const historical = structuredClone(defaultTasteConfig);
    historical.profiles.목.title = 'Older title';
    const current = {
      ...row(),
      history: [
        {
          revision: 1,
          config: historical,
          publishedAt: '2026-01-01T00:00:00Z',
        },
      ],
    };
    const calls: { table: string; operation: string; value?: unknown }[] = [];
    await changeTasteSettings(
      'synthetic',
      { action: 'restore', revision: 4, targetRevision: 1 },
      fakeClient(
        [
          ok(current),
          ok({ id: 'current' }),
          ok({ ...current, revision: 5, draft: historical }),
        ],
        calls,
      ),
    );
    const update = calls.find((call) => call.operation === 'update')
      ?.value as Record<string, unknown>;
    assert.equal(
      (update.draft as typeof historical).profiles.목.title,
      'Older title',
    );
    assert.deepEqual(update.published, current.published);
  });
  it('rejects unsupported product fields, invalid prices, and stale product updates', async () => {
    assert.throws(
      () => parseProductPatch({ price: -1, active: true, updatedAt: null }),
      hasStatus(400),
    );
    assert.throws(
      () =>
        parseProductPatch({
          price: 100,
          active: true,
          updatedAt: null,
          name: 'unexpected',
        }),
      hasStatus(400),
    );
    await assert.rejects(
      updateAdminProduct(
        'raw-01',
        { price: 100, active: true, updatedAt: null },
        fakeClient([ok(null)]),
      ),
      hasStatus(409),
    );
    const calls: { table: string; operation: string; value?: unknown }[] = [];
    await updateAdminProduct(
      'raw-01',
      { price: 150, active: false, updatedAt: null },
      fakeClient([ok({ id: 'raw-01' })], calls),
    );
    const update = calls.find((call) => call.operation === 'update')
      ?.value as Record<string, unknown>;
    assert.deepEqual(Object.keys(update).sort(), [
      'is_active',
      'portion_price',
      'updated_at',
    ]);
    assert.ok(
      calls.some(
        (call) => call.operation === 'is:updated_at' && call.value === null,
      ),
    );
  });
});
