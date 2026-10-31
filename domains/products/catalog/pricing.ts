import type { MenuBinding } from './menu';
import { catalogProducts } from './catalog';

// Reviewed product identities only. Prices always come from the current DB row.
const originalProducts = [
  { catalogId: 'raw-13', productId: 'prd_001', name: '사과' },
  { catalogId: 'raw-21', productId: 'prd_006', name: '용과' },
  { catalogId: 'raw-22', productId: 'prd_005', name: '복숭아' },
  { catalogId: 'raw-24', productId: 'prd_018', name: '케일' },
] as const;

export type PriceRow = {
  id: string;
  name: string | null;
  portion_price: number | null;
  is_active: boolean | null;
  details?: unknown;
};

export function approvedPriceBindings(rows: PriceRow[]): MenuBinding[] {
  return rows.flatMap((row) => {
    const original = originalProducts.find(
      (product) => product.productId === row.id && product.name === row.name,
    );
    const details =
      row.details &&
      typeof row.details === 'object' &&
      !Array.isArray(row.details)
        ? (row.details as Record<string, unknown>)
        : undefined;
    const demo =
      details?.demoPricing && typeof details.demoPricing === 'object'
        ? (details.demoPricing as Record<string, unknown>)
        : undefined;
    const catalog = catalogProducts.find(
      (product) => product.id === row.id && product.name === row.name,
    );
    // New demo rows use their exact catalog ID and an explicit provenance marker.
    const approved =
      original ??
      (catalog &&
      details?.catalogId === catalog.id &&
      demo?.version === '2026-10-31-v1'
        ? { catalogId: catalog.id, productId: row.id }
        : undefined);
    if (!approved) return [];
    const price =
      row.is_active === true &&
      row.portion_price !== null &&
      Number.isSafeInteger(row.portion_price) &&
      row.portion_price > 0
        ? row.portion_price
        : null;
    return [
      {
        catalogId: approved.catalogId,
        productId: row.id,
        active: row.is_active === true,
        price,
      },
    ];
  });
}
