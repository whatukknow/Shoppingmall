import raw from '../data/rawProducts.json';
import kits from '../data/diyKits.json';

export { raw, kits };
export const catalogProducts = [...raw, ...kits];
export function findCatalogProduct(idOrName: string) {
  return catalogProducts.find((p) => p.id === idOrName || p.name === idOrName);
}
export function findRawProduct(name: string) {
  return raw.find((p) => p.id === name || p.name === name);
}
export function catalogImages(idOrName: string) {
  const p = findCatalogProduct(idOrName);
  if (!p) return undefined;
  if ('includedIngredients' in p)
    return {
      catalog: p.catalogImage,
      gallery: p.images,
      recommendation: p.catalogImage,
      story: p.storyImage,
      portion: undefined,
    };
  return {
    catalog: p.image,
    gallery: p.galleryImages,
    recommendation: p.carouselImage,
    story: p.farmCardImage,
    portion: p.tasteFinderImage,
  };
}
// Explicit catalog IDs bind operational rows. Exact names are a conservative fallback;
// fuzzy matching would incorrectly attach stock/prices to a different ingredient.
export function catalogIdForRow(row: {
  id: string;
  name: string | null;
  details?: unknown;
}) {
  const details = row.details;
  const explicit =
    details && typeof details === 'object' && !Array.isArray(details)
      ? (details as Record<string, unknown>).catalogId
      : undefined;
  if (typeof explicit === 'string') return findCatalogProduct(explicit)?.id;
  return (
    findCatalogProduct(row.id)?.id ?? findCatalogProduct(row.name ?? '')?.id
  );
}
