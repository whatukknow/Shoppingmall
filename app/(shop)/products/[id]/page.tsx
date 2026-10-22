import { Suspense } from 'react';

import ProductDetailContainer from '@/domains/products/containers/ProductDetailContainer';
import { ProductDetailSkeleton } from '@/domains/products/components/ProductDetailSkeleton';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailParams params={params} />
    </Suspense>
  );
}

async function ProductDetailParams({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailContainer id={id} />;
}
