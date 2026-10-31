import { createServerClient } from '@/shared/lib/supabase/server';
import { getProductDetail as getOperationalDetail } from '../products.server';
import { catalogImages, findCatalogProduct } from './catalog';
import { menuDetail, menuList } from './menu';
import { approvedPriceBindings, type PriceRow } from './pricing';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/lib/supabase/database.types';
import type { ProductSort } from '../products.types';

async function bindings(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from('products')
    .select('id,name,details,is_active,portion_price');
  if (error) throw error;
  return approvedPriceBindings((data ?? []) as PriceRow[]);
}
export async function listMenuProducts(
  options: {
    category?: string;
    sort?: ProductSort;
    limit?: number;
    offset?: number;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
) {
  return menuList(await bindings(client), options);
}
export async function listMenuRecommendations(limit: number) {
  const result = await listMenuProducts();
  const shuffled = [...result.list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const list = shuffled
    .slice(0, limit > 0 ? limit : shuffled.length)
    .map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: catalogImages(p.id)!.recommendation,
    }));
  return { list, total: result.total, limit: list.length, offset: 0 };
}
export async function getMenuProductDetail(
  id: string,
  client: SupabaseClient<Database> = createServerClient(),
) {
  const allBindings = await bindings(client);
  const canonical =
    findCatalogProduct(id) ??
    findCatalogProduct(
      allBindings.find((b) => b.productId === id)?.catalogId ?? '',
    );
  // Keep historical operational URLs while applying the same activity/price checks
  // to both canonical and bound IDs. Existing IDs are never rewritten in the DB.
  if (!canonical) {
    const operational = await getOperationalDetail(id, client);
    return operational
      ? { ...operational, price: null, isPurchasable: false }
      : null;
  }
  const matches = allBindings.filter((b) => b.catalogId === canonical.id);
  if (matches.length !== 1) return menuDetail(canonical.id, null);
  const binding = matches[0];
  const operational = await getOperationalDetail(
    binding.productId,
    client,
    (row) => {
      const latest = approvedPriceBindings([row])[0];
      return latest?.catalogId === canonical.id && latest.price !== null;
    },
  );
  return menuDetail(
    canonical.id,
    operational ? { ...operational, isSample: true } : null,
    operational !== null,
  );
}
