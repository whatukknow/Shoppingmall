import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getProductById } from '@/domains/products/products.api';
import ProductDetailView from '@/domains/product-detail/components/ProductDetailPage';
import type { ProductDetail } from '@/domains/product-detail/data/productDetail.types';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <p role="status" className="px-6 py-10">
          상품 정보를 불러오는 중입니다.
        </p>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({ params }: PageProps) {
  const { id } = await params;
  const catalogProduct = await getProductById(id);

  if (!catalogProduct || catalogProduct.id === undefined) {
    notFound();
  }

  const product: ProductDetail = {
    id: String(catalogProduct.id),
    name: catalogProduct.name,
    category: catalogProduct.category,

    images: catalogProduct.image ? [catalogProduct.image] : [],

    price: catalogProduct.price,
    isSample: true,

    description: {
      tips: [],
    },
  };

  return <ProductDetailView product={product} pods={null} />;
}
