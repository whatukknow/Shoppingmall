import { createServerClient } from '@/shared/lib/supabase/server';
import { getProductDetail as getOperationalDetail } from '../products.server';
import { catalogImages, findCatalogProduct } from './catalog';
import {
  catalogIdForRow,
  menuDetail,
  menuList,
  type MenuBinding,
} from './menu';
import type { ProductSort } from '../products.types';

type OperationalRow = {
  id: string;
  name: string | null;
  details: unknown;
  is_active: boolean | null;
  portion_price: number | null;
};
async function bindings() {
  const client = createServerClient();
  const { data, error } = await client
    .from('products')
    .select('id,name,details,is_active,portion_price');
  if (error) throw error;
  const result: MenuBinding[] = [];
  for (const row of (data ?? []) as OperationalRow[]) {
    const catalogId = catalogIdForRow(row);
    // Ambiguous duplicate rows must be bound explicitly before enabling purchases.
    if (catalogId)
      result.push({
        catalogId,
        productId: row.id,
        active: row.is_active === true,
        price: row.portion_price,
      });
  }
  return result;
}
export async function listMenuProducts(
  options: {
    category?: string;
    sort?: ProductSort;
    limit?: number;
    offset?: number;
  } = {},
) {
  return menuList(await bindings(), options);
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
export async function getMenuProductDetail(id: string) {
  const allBindings = await bindings();
  const canonical =
    findCatalogProduct(id) ??
    findCatalogProduct(
      allBindings.find((b) => b.productId === id)?.catalogId ?? '',
    );
  // Keep historical operational URLs while applying the same activity/price checks
  // to both canonical and bound IDs. Existing IDs are never rewritten in the DB.
  if (!canonical) return getOperationalDetail(id);
  const matches = allBindings.filter((b) => b.catalogId === canonical.id);
  if (matches.length !== 1) return menuDetail(canonical.id, null);
  const binding = matches[0];
  const operational = await getOperationalDetail(binding.productId);
  return menuDetail(
    canonical.id,
    operational ? { ...operational, price: binding.price } : null,
    binding.active && binding.price !== null && binding.price > 0,
  );
}
