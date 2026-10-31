import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Dry-run by default. Uses existing server credentials; never prints keys or rows.
const apply = process.argv.includes('--apply');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(new URL(url).hostname, 'xmygtwzyzubfrarqplew.supabase.co');
assert.ok(
  process.env.SUPABASE_SECRET_KEY,
  'Existing server credential required',
);
const db = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const readJson = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const proposal = readJson(
  '../domains/products/data/demo-prices-2026-10-31.json',
);
const raw = readJson('../domains/products/data/rawProducts.json');
const kits = readJson('../domains/products/data/diyKits.json');
const catalog = [...raw, ...kits];
assert.equal(proposal.products.length, 56);
assert.equal(new Set(proposal.products.map((p) => p.catalog_id)).size, 56);
const { data: before, error: readError } = await db
  .from('products')
  .select('*');
if (readError) throw new Error(`Product read failed: ${readError.code}`);
const { data: categories, error: categoryError } = await db
  .from('categories')
  .select('id,category');
if (categoryError)
  throw new Error(`Category read failed: ${categoryError.code}`);
const now = new Date().toISOString();
const inserts = [];
for (const p of proposal.products) {
  const item = catalog.find((c) => c.id === p.catalog_id && c.name === p.name);
  assert.ok(item, `Catalog identity mismatch: ${p.catalog_id}`);
  assert.ok(Number.isSafeInteger(p.demo_price_krw) && p.demo_price_krw > 0);
  if (p.confirmed_db_product_id) {
    const current = before.find((r) => r.id === p.confirmed_db_product_id);
    assert.ok(
      current &&
        current.name === p.name &&
        current.portion_price === p.demo_price_krw,
      `Approved existing row changed: ${p.catalog_id}`,
    );
    continue; // Existing four rows remain byte-for-byte unchanged.
  }
  const current = before.find((r) => r.id === p.catalog_id);
  if (current) {
    assert.ok(
      current.name === p.name &&
        current.details?.catalogId === p.catalog_id &&
        current.details?.demoPricing?.version === '2026-10-31-v1',
      `ID collision: ${p.catalog_id}`,
    );
    assert.equal(
      current.portion_price,
      p.demo_price_krw,
      `Existing demo price differs from approved seed; no overwrite: ${p.catalog_id}`,
    );
    continue;
  }
  assert.ok(
    !before.some((r) => r.details?.catalogId === p.catalog_id),
    `Existing binding: ${p.catalog_id}`,
  );
  const categoryName =
    p.kind === 'kit'
      ? '밀키트'
      : ['계란', '달걀'].includes(item.category)
        ? '유제품'
        : item.category === '수산물'
          ? '수산'
          : item.category;
  const category = categories.find((c) => c.category === categoryName);
  assert.ok(category, `Unknown category: ${categoryName}`);
  inserts.push({
    id: p.catalog_id,
    name: p.name,
    product_type: p.kind === 'kit' ? 'kit' : 'raw',
    category_id: category.id,
    gid: null,
    farm_name: null,
    portion_amount: p.kind === 'kit' ? 1 : p.portion_amount,
    portion_unit: p.kind === 'kit' ? '세트' : p.portion_unit,
    portion_label: p.portion_label,
    portion_price: p.demo_price_krw,
    is_active: true,
    sort_order: catalog.indexOf(item),
    created_at: now,
    details: {
      catalogId: p.catalog_id,
      summary:
        p.kind === 'kit'
          ? `시연용 소분 재료: ${p.included_label}`
          : '시연용 소분 상품',
      ...(p.kind === 'kit'
        ? {
            includedIngredients: p.included_ingredients,
            separate: p.bring_your_own,
          }
        : {}),
      demoPricing: {
        version: '2026-10-31-v1',
        kind: 'demo',
        status: 'user_approved_demo',
        checkedAt: proposal.checked_at,
        savedAt: now,
        basisStatus: p.basis_status,
        basis: p.basis,
        sources: proposal.sources,
      },
    },
  });
}
console.log(
  JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    existing: before.length,
    insertCount: inserts.length,
    reusedApproved: 4,
    catalogCount: catalog.length,
  }),
);
if (apply && inserts.length) {
  // Local-only recovery copy contains products only, no account/order/user records.
  const backup = join(
    tmpdir(),
    `little-portions-products-before-${Date.now()}.json`,
  );
  writeFileSync(backup, JSON.stringify(before), { mode: 0o600 });
  console.log(
    JSON.stringify({
      backupSavedLocally: true,
      beforeSha256: createHash('sha256')
        .update(JSON.stringify(before))
        .digest('hex'),
    }),
  );
  // One insert request: a conflict fails the batch, never overwrites existing rows.
  const { error } = await db.from('products').insert(inserts);
  if (error)
    throw new Error(`Product insert failed: ${error.code} ${error.message}`);
  console.log(JSON.stringify({ writeCommitted: true, saved: inserts.length }));
  let verificationStage = 'READBACK_SELECT';
  try {
    const { data: after, error: afterError } = await db
      .from('products')
      .select('*');
    if (afterError) throw new Error(`Readback failed: ${afterError.code}`);
    verificationStage = 'EXISTING_ROWS_COMPARE';
    for (const original of before)
      assert.deepEqual(
        after.find((r) => r.id === original.id),
        original,
      );
    verificationStage = 'INSERTED_ROWS_COMPARE';
    for (const expected of inserts) {
      const actual = after.find((r) => r.id === expected.id);
      for (const key of Object.keys(expected)) {
        if (key === 'created_at') {
          assert.equal(
            Date.parse(actual?.[key]),
            Date.parse(expected[key]),
            `${expected.id}.${key}`,
          );
        } else {
          assert.deepEqual(
            actual?.[key],
            expected[key],
            `${expected.id}.${key}`,
          );
        }
      }
    }
    verificationStage = 'ROW_COUNT_COMPARE';
    assert.equal(after.length, before.length + inserts.length);
    console.log(
      JSON.stringify({
        saved: inserts.length,
        totalRows: after.length,
        allOriginalRowsUnchanged: true,
        readback: 'passed',
      }),
    );
  } catch {
    throw new Error(
      `Product insert committed, but readback verification failed (${verificationStage}). No rollback was performed. Inspect the database before retrying.`,
    );
  }
}
