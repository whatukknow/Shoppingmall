'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/shared/lib/analytics/client';
import type { PurchaseAnalyticsPayload } from '@/domains/payment/analytics/purchase';

export default function PurchaseAnalytics({
  purchase,
}: {
  purchase: PurchaseAnalyticsPayload | null;
}) {
  useEffect(() => {
    if (purchase) trackPurchase(purchase);
  }, [purchase]);
  return null;
}
