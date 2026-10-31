import { catalogIdForRow, raw, kits } from './catalog';

/** Buying-group cards use existing cutouts; other image roles stay unchanged. */
export function podCutoutImage(
  productId: string,
  name: string,
  fallback = '',
): string {
  const id = catalogIdForRow({ id: productId, name });
  const crop = raw.find((product) => product.id === id);
  if (crop) return crop.tasteFinderImage;
  const kit = kits.find((product) => product.id === id);
  return kit?.catalogImage ?? fallback;
}
