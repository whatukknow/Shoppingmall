import { foodLabel } from '@/shared/lib/food-label';
import type { ProductDetail } from '../data/productDetail.types';
import { formatPrice } from '@/shared/utils/formatPrice';

type ProductInfoProps = Pick<
  ProductDetail,
  'name' | 'category' | 'farmName' | 'price' | 'discountRate' | 'unit'
>;

export default function ProductInfo({
  name,
  category,
  farmName,
  price,
  discountRate,
  unit,
}: ProductInfoProps) {
  const hasDiscount =
    discountRate !== undefined && discountRate > 0 && discountRate <= 100;

  return (
    <section className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">{foodLabel(category)}</p>

      <h1 className="text-3xl font-bold">{foodLabel(name)}</h1>

      {farmName && (
        <p className="text-muted-foreground text-sm">
          Farm: {foodLabel(farmName)}
        </p>
      )}

      {unit && <p className="text-sm">{foodLabel(unit)}</p>}

      <div className="flex items-center gap-3">
        {hasDiscount && (
          <span className="text-primary font-bold">- {discountRate}%</span>
        )}

        <strong className="text-2xl">{formatPrice(price)}</strong>
      </div>
    </section>
  );
}
