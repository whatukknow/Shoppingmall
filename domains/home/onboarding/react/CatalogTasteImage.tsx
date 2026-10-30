import { foodLabel } from '@/shared/lib/food-label';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import {
  catalogImages,
  findCatalogProduct,
} from '@/domains/products/catalog/catalog';

/** Food images in Taste Finder: raw portion slot 06, kit catalog slot 08. */
export function CatalogTasteImage({
  name,
  style,
  title,
}: {
  name: string;
  style?: CSSProperties;
  title?: string;
}) {
  const product = findCatalogProduct(name);
  const images = catalogImages(name);
  if (!product || !images) return null;
  const src = images.portion ?? images.catalog;
  return (
    <span
      className="px"
      title={title ? foodLabel(title) : undefined}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <Image
        src={src}
        alt={`${foodLabel(product.name)} — ${images.portion ? 'portion image concept' : 'DIY kit concept'}`}
        fill
        sizes="52px"
        style={{ objectFit: 'contain' }}
      />
    </span>
  );
}
