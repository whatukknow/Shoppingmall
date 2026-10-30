export function formatPrice(price: number | null): string {
  if (price === null) return 'Price to be confirmed';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price);
}
