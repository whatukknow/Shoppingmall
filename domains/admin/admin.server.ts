import { createServerClient } from '@/shared/lib/supabase/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/lib/supabase/database.types';
import { AdminError, isAdmin } from './access';
import {
  defaultTasteConfig,
  parseTasteConfig,
  parseRevision,
  type TasteConfig,
} from './taste-config';
import { approvedPriceBindings } from '@/domains/products/catalog/pricing';
import { catalogIdForRow } from '@/domains/products/catalog/catalog';

export async function requireAdmin(client = createServerClient()) {
  const { data, error } = await client.auth.getUser();
  if (error && ![400, 401, 403].includes(error.status ?? 0))
    throw new AdminError(503, 'Authentication is temporarily unavailable.');
  if (error || !data.user)
    throw new AdminError(
      401,
      'Log in with an authorized administrator account.',
    );
  if (!isAdmin(data.user))
    throw new AdminError(403, 'Administrator access is required.');
  return data.user;
}
export function adminResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  });
}
export function adminFailure(error: unknown) {
  if (error instanceof AdminError)
    return adminResponse({ error: { message: error.message } }, error.status);
  console.error(
    'Admin operation failed',
    error instanceof Error ? error.name : 'DatabaseError',
  );
  return adminResponse(
    {
      error: { message: 'The operation could not be completed. Please retry.' },
    },
    500,
  );
}
export async function adminSummary(client = createAdminClient()) {
  const [products, orders, profiles] = await Promise.all([
    operationalClient(client)
      .from('products')
      .select('id', { count: 'exact', head: true }),
    operationalClient(client)
      .from('orders')
      .select('id', { count: 'exact', head: true }),
    operationalClient(client)
      .from('taste_profiles')
      .select('id', { count: 'exact', head: true }),
  ]);
  if (products.error || orders.error || profiles.error)
    throw new AdminError(503, 'Could not load operational totals.');
  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    tasteProfiles: profiles.count ?? 0,
  };
}
export async function adminProducts(client = createAdminClient()) {
  const { data, error, count } = await operationalClient(client)
    .from('products')
    .select(
      'id,name,product_type,portion_label,portion_price,is_active,updated_at,details,sort_order',
      { count: 'exact' },
    )
    .order('sort_order', { ascending: true })
    .limit(200);
  if (error) throw new AdminError(503, 'Could not load products.');
  if ((count ?? 0) > 200)
    throw new AdminError(
      503,
      'Product validation requires pagination before this catalog can be edited safely.',
    );
  const bindings = approvedPriceBindings(data ?? []);
  return (data ?? []).map((row) => ({
    id: row.id,
    catalogId: catalogIdForRow(row) ?? null,
    name: row.name,
    productType: row.product_type,
    portionLabel: row.portion_label,
    price: row.portion_price,
    active: row.is_active,
    updatedAt: row.updated_at,
    purchasable: (() => {
      const matches = bindings.filter(
        (binding) => binding.catalogId === catalogIdForRow(row),
      );
      return (
        matches.length === 1 &&
        matches[0].productId === row.id &&
        matches[0].active &&
        matches[0].price !== null
      );
    })(),
  }));
}
export function parseProductPatch(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AdminError(400, 'Invalid product update.');
  const data = input as Record<string, unknown>;
  if (Object.keys(data).sort().join(',') !== 'active,price,updatedAt')
    throw new AdminError(400, 'Only price and availability can be changed.');
  if (
    !Number.isSafeInteger(data.price) ||
    (data.price as number) <= 0 ||
    (data.price as number) > 100_000_000 ||
    typeof data.active !== 'boolean' ||
    (data.updatedAt !== null &&
      (typeof data.updatedAt !== 'string' ||
        !Number.isFinite(Date.parse(data.updatedAt))))
  ) {
    throw new AdminError(
      400,
      'Use a positive whole-number price, a sale status, and the current product timestamp.',
    );
  }
  return {
    price: data.price as number,
    active: data.active,
    updatedAt: data.updatedAt as string | null,
  };
}
export async function updateAdminProduct(
  id: string,
  input: unknown,
  client = createAdminClient(),
) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
    throw new AdminError(400, 'Invalid product ID.');
  const data = parseProductPatch(input);
  let query = operationalClient(client)
    .from('products')
    .update({
      portion_price: data.price,
      is_active: data.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  query =
    data.updatedAt === null
      ? query.is('updated_at', null)
      : query.eq('updated_at', data.updatedAt);
  const result = await query
    .select('id,portion_price,is_active,updated_at')
    .maybeSingle();
  if (result.error) throw new AdminError(503, 'Could not save the product.');
  if (!result.data)
    throw new AdminError(
      409,
      'This product changed or no longer exists. Reload before saving.',
    );
  return result.data;
}
export async function adminOrders(client = createAdminClient()) {
  // No address, phone, or customer identity in the operational list.
  const { data, error } = await operationalClient(client)
    .from('orders')
    .select('id,status,total,created_at,payment_mode')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new AdminError(503, 'Could not load orders.');
  return data ?? [];
}

type History = { revision: number; config: TasteConfig; publishedAt: string };
export type TasteSettings = {
  revision: number;
  publishedRevision: number | null;
  draft: TasteConfig;
  published: TasteConfig | null;
  history: History[];
  setupRequired: boolean;
};
type ConfigRow = {
  id: string;
  revision: number;
  draft: unknown;
  published: unknown;
  published_revision: number | null;
  history: unknown;
};
// One additional service-only table; unrelated generated schema types stay intact.
export type AdminDatabase = {
  public: {
    Tables: {
      [
        K in keyof Database['public']['Tables']
      ]: Database['public']['Tables'][K] & { Relationships: [] };
    } & {
      admin_taste_config: {
        Row: ConfigRow;
        Insert: Partial<ConfigRow> & { id: string };
        Update: Partial<ConfigRow> & {
          updated_by?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
  };
};
const operationalClient = (client: SupabaseClient<Database>) =>
  client as unknown as SupabaseClient<AdminDatabase>;
const configClient = (client: SupabaseClient<Database>) =>
  client as unknown as SupabaseClient<AdminDatabase>;
function missingTable(error: { code?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01';
}
export async function readTasteSettings(
  client = createAdminClient(),
): Promise<TasteSettings> {
  const { data, error } = await configClient(client)
    .from('admin_taste_config')
    .select('*')
    .eq('id', 'current')
    .maybeSingle();
  if (error && !missingTable(error))
    throw new AdminError(503, 'Could not read taste settings.');
  if (error || !data)
    return {
      revision: 0,
      publishedRevision: null,
      draft: structuredClone(defaultTasteConfig),
      published: null,
      history: [],
      setupRequired: true,
    };
  return {
    revision: data.revision,
    publishedRevision: data.published_revision,
    draft: parseTasteConfig(data.draft),
    published: data.published ? parseTasteConfig(data.published) : null,
    history: Array.isArray(data.history) ? (data.history as History[]) : [],
    setupRequired: false,
  };
}
export async function publishedTasteConfig(client?: SupabaseClient<Database>) {
  if (!client && !process.env.SUPABASE_SECRET_KEY)
    return { config: structuredClone(defaultTasteConfig), revision: 0 };
  const settings = await readTasteSettings(client ?? createAdminClient());
  return {
    config: settings.published ?? structuredClone(defaultTasteConfig),
    revision: settings.publishedRevision ?? 0,
  };
}
export async function changeTasteSettings(
  userId: string,
  input: unknown,
  client = createAdminClient(),
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AdminError(400, 'Invalid settings request.');
  const body = input as Record<string, unknown>;
  const revision = parseRevision(body.revision);
  const action = body.action;
  if (!['save', 'publish', 'restore'].includes(String(action)))
    throw new AdminError(400, 'Unknown settings action.');
  const current = await readTasteSettings(client);
  if (current.setupRequired)
    throw new AdminError(
      503,
      'The taste configuration migration must be applied first.',
    );
  if (current.revision !== revision)
    throw new AdminError(409, 'Settings changed. Reload before saving.');
  let draft = current.draft;
  if (action === 'save') draft = parseTasteConfig(body.config);
  if (action === 'restore') {
    const target = current.history.find(
      (item) => item.revision === parseRevision(body.targetRevision),
    );
    if (!target) throw new AdminError(404, 'Published version not found.');
    draft = parseTasteConfig(target.config);
  }
  const next = revision + 1;
  const now = new Date().toISOString();
  let published = current.published,
    publishedRevision = current.publishedRevision,
    history = current.history;
  if (action === 'publish') {
    const ids = [...new Set(Object.values(draft.recommendations).flat())];
    if (ids.length) {
      const products = await adminProducts(client);
      if (
        ids.some(
          (id) => !products.some((p) => p.catalogId === id && p.purchasable),
        )
      ) {
        throw new AdminError(
          400,
          'Each recommended product must be active and have a positive price.',
        );
      }
    }
    published = draft;
    publishedRevision = next;
    history = [
      { revision: next, config: draft, publishedAt: now },
      ...history,
    ].slice(0, 10);
  }
  const { data, error } = await configClient(client)
    .from('admin_taste_config')
    .update({
      revision: next,
      draft,
      published,
      published_revision: publishedRevision,
      history,
      updated_at: now,
      updated_by: userId,
    })
    .eq('id', 'current')
    .eq('revision', revision)
    .select('id')
    .maybeSingle();
  if (error) throw new AdminError(503, 'Could not save taste settings.');
  if (!data)
    throw new AdminError(409, 'Settings changed. Reload before saving.');
  return readTasteSettings(client);
}
