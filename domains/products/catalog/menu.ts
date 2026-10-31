import { foodLabel } from '@/shared/lib/food-label';
import {
  catalogProducts,
  catalogIdForRow,
  catalogImages,
  findCatalogProduct,
} from './catalog';
import type {
  ProductDetailResponse,
  ProductListItem,
  ProductSort,
} from '../products.types';

export type MenuBinding = {
  catalogId: string;
  productId: string;
  active: boolean;
  price: number | null;
};
export function menuList(
  bindings: MenuBinding[],
  {
    category = 'all',
    sort = 'latest',
    limit = 0,
    offset = 0,
  }: {
    category?: string;
    sort?: ProductSort;
    limit?: number;
    offset?: number;
  } = {},
) {
  let items: ProductListItem[] = catalogProducts
    .map((p) => {
      const matches = bindings.filter((b) => b.catalogId === p.id);
      const binding = matches.length === 1 ? matches[0] : undefined;
      const kit = 'includedIngredients' in p;
      return {
        id: p.id,
        name: p.name,
        category: kit ? `DIY kits · ${foodLabel(p.category)}` : p.category,
        imageUrl: catalogImages(p.id)!.catalog,
        description: kit
          ? 'DIY kit with ingredients from our catalog'
          : 'Raw ingredients to share in the portions you need',
        price: binding?.price ?? null,
      };
    })
    .filter((p) => !category || category === 'all' || p.category === category);
  if (sort !== 'latest')
    items = items.sort(
      (a, b) => a.name.localeCompare(b.name, 'ko') * (sort === 'desc' ? -1 : 1),
    );
  return {
    list:
      limit === 0 ? items.slice(offset) : items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}
export function menuDetail(
  catalogId: string,
  operational: ProductDetailResponse | null,
  purchasable = false,
): ProductDetailResponse | null {
  const p = findCatalogProduct(catalogId);
  if (!p) return operational;
  const images = catalogImages(p.id)!;
  const kit = 'includedIngredients' in p;
  const included = kit ? p.included.map(foodLabel).join(' · ') : p.name;
  const separate = kit ? p.separate.map(foodLabel).join(' · ') : '';
  return {
    id: operational?.id ?? p.id,
    catalogId: p.id,
    name: p.name,
    category: kit ? `DIY kits · ${foodLabel(p.category)}` : p.category,
    images: images.gallery,
    farmName: operational?.farmName ?? '',
    price: operational?.price ?? null,
    unit: operational?.unit || 'Pack contents and quantities to be confirmed',
    discountRate: operational?.discountRate ?? 0,
    description: kit
      ? 'DIY kit with ingredients from our catalog'
      : 'Raw ingredients to share in the portions you need',
    farmInfo: kit ? `Included ingredients: ${included}` : p.farmInfo,
    farmImageUrl: images.story,
    basicInfo: {
      ...operational?.basicInfo,
      contentGuide: kit
        ? `Included ingredients: ${included}`
        : operational?.basicInfo.contentGuide || 'Portion size to be confirmed',
      ingredients: kit
        ? `Included: ${included}. Bring your own: ${separate}`
        : p.name,
      allergyInfo:
        operational?.basicInfo.allergyInfo ||
        'Check the supplier’s product label',
      storageMethod:
        operational?.basicInfo.storageMethod ||
        'Details will be provided once supply specifications are confirmed',
      shippingInfo:
        operational?.basicInfo.shippingInfo ||
        'Shipping details to be confirmed',
      notice: kit
        ? p.reviewNote
        : 'Images are concepts. The actual supplier and packaging specifications require separate confirmation.',
    },
    tips: kit
      ? p.recipeSteps.map((content, i) => ({
          id: `${p.id}-step-${i + 1}`,
          title: `Step ${i + 1}`,
          content,
        }))
      : (operational?.tips ?? []),
    isPurchasable: purchasable,
    isSample: operational?.isSample ?? false,
  };
}
export { catalogIdForRow };
