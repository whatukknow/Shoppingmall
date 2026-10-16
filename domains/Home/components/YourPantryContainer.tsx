'use client';

import { YourPantry, type PantryProduct } from './YourPantry';

type YourPantryContainerProps = {
  products: PantryProduct[];
  onAddToCart?: (productId: string) => void;
};

export function YourPantryContainer({
  products,
  onAddToCart,
}: YourPantryContainerProps) {
  const handleAddToCart = onAddToCart ?? (() => {});

  return <YourPantry products={products} onAddToCart={handleAddToCart} />;
}
