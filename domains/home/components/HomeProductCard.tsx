import Image from 'next/image';
import Link from 'next/link';
import type { HomeCardItem } from '../home.types';

/** 홈 캐러셀에서 재사용하는 상품 카드입니다. */
export function HomeProductCard({
  product,
  href,
  rank,
}: {
  product: HomeCardItem;
  href: string; // 카드를 눌렀을 때 이동할 주소
  rank?: number;
}) {
  const cardContent = (
    <>
      <div className="flex h-[150px] items-center justify-center sm:h-[190px]">
        <Image
          src={product.imageUrl}
          alt=""
          width={170}
          height={170}
          sizes="(max-width: 640px) 138px, 170px"
          className="size-[138px] object-contain sm:size-[170px]"
        />
      </div>
      <div className="pt-3">
        {rank !== undefined && (
          <p className="font-heading text-primary text-xs">
            TOP {String(rank).padStart(2, '0')}
          </p>
        )}
        <h3 className="mt-1 text-base leading-7 font-bold sm:text-[19px]">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-xs leading-5 text-[#77766f]">
            {product.description}
          </p>
        )}
      </div>
    </>
  );

  return (
    <Link
      href={href}
      className="block min-w-0 transition-opacity hover:opacity-75"
    >
      {cardContent}
    </Link>
  );
}
