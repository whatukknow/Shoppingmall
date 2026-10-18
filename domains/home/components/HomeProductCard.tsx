import Link from 'next/link';
import type { HomeProduct } from '../data/homeProducts';
import { HomeProductIllustration } from './HomeProductIllustration';

export function HomeProductCard({ product, rank }: { product: HomeProduct; rank?: number }) {
  return (
    <Link href="/products" className="block min-w-0 transition-opacity hover:opacity-75">
      <div className="flex h-[150px] items-center justify-center sm:h-[190px]">
        <HomeProductIllustration kind={product.illustration} />
      </div>
      <div className="pt-3">
        {rank !== undefined && (
          <p className="font-heading text-primary text-xs">
            TOP {String(rank).padStart(2, '0')}
          </p>
        )}
        <h3 className="mt-1 text-base leading-7 font-bold sm:text-[19px]">{product.name}</h3>
        <p className="mt-1 text-xs leading-5 text-[#77766f]">{product.description}</p>
      </div>
    </Link>
  );
}
