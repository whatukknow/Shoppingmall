import {
  catalogIdForRow,
  catalogImages,
  findCatalogProduct,
} from './catalog/catalog';
import type {
  ProductDetailBasicInfo,
  ProductListItem,
  ProductDetailResponse,
} from './products.types';
import type { RecommendedProduct } from '@/domains/home/home.types';
import type { Database } from '@/shared/lib/supabase/database.types';

type ProductsRow = Database['public']['Tables']['products']['Row'];

/** details JSON에서 요약 텍스트를 꺼냅니다. */
function toDescription(details: ProductsRow['details']): string {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return '';
  }
  const summary = (details as Record<string, unknown>).summary;
  return typeof summary === 'string' ? summary : '';
}

/** GET products → ProductListItem () */
export function toProductListItem(
  row: ProductsRow,
  imageUrl: string,
  category: string,
): ProductListItem {
  return {
    id: row.id,
    name: row.name ?? '',
    imageUrl,
    description: toDescription(row.details),
    category,
    price: row.portion_price ?? 0,
  };
}

/** GET products/:id → ProductDetailResponse (). 없는 필드는 기본값. */
export function toProductDetail(
  row: ProductsRow,
  category: string,
  images: string[],
): ProductDetailResponse {
  const basicInfo: ProductDetailBasicInfo = {
    contentGuide: '',
    ingredients: '',
    allergyInfo: '',
    storageMethod: '',
    shippingInfo: '',
    notice: '',
  };
  return {
    id: row.id,
    name: row.name ?? '',
    category,
    images,
    farmName: row.farm_name ?? '',
    price: row.portion_price ?? 0,
    unit: row.portion_label ?? '',
    discountRate: 0, // 컬럼 없음 → 기본값 0
    description: toDescription(row.details),
    farmInfo: '',
    farmImageUrl: images[0] ?? '',
    basicInfo,
    tips: [],
  };
}

/** 홈 랜덤 추천 → RecommendedProduct () */
export function toRecommendedProduct(
  row: ProductsRow,
  imageUrl: string,
): RecommendedProduct {
  const catalogId = catalogIdForRow(row);
  const item = catalogId ? findCatalogProduct(catalogId) : undefined;
  return {
    id: item?.id ?? row.id,
    name: item?.name ?? row.name ?? '',
    imageUrl: item ? catalogImages(item.id)!.recommendation : imageUrl,
  };
}
