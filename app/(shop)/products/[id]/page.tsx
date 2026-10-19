import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductById } from '@/domains/products/products.api';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <main className="bg-background flex-1 pb-24 font-sans">
      <section className="mx-auto w-full max-w-[1080px] px-6 pt-10">
        <Link href="/products" className="text-foreground text-sm underline underline-offset-4">
          ← 전체 상품
        </Link>
        <article className="mt-8 grid gap-8 sm:grid-cols-2 sm:items-start">
          <div className="relative aspect-square w-full overflow-hidden">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-contain p-8" />
            ) : (
              <div className="text-foreground/55 flex h-full items-center justify-center text-sm">
                이미지 준비 중
              </div>
            )}
          </div>
          <div className="sm:pt-4">
            <p className="text-foreground/65 text-sm">{product.category}</p>
            <h1 className="text-primary mt-2 text-3xl font-bold">{product.name}</h1>
            <p className="text-foreground mt-6 text-xl font-semibold">
              {product.samplePrice.toLocaleString('ko-KR')}원
            </p>
            <p className="text-foreground/55 mt-2 text-xs">시안 예시 금액</p>
            <p className="text-foreground/75 border-primary/20 mt-8 border-t pt-5 text-sm leading-6">
              시안 확인을 위한 상품 정보입니다. 실제 판매 및 재고 정보가 아닙니다.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
