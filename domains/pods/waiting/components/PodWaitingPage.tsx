'use client';

import { foodLabel } from '@/shared/lib/food-label';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import PodProgress from '@/domains/pods/waiting/components/PodProgress';
import PodStatusCard from './PodStatusCard';
import PodApplicationSummary from './PodApplicationSummary';

import { Button, EmptyState } from '@/shared/components';
import { saveSelectedPodIds } from '@/domains/payment/data/payment.session';
import { summarize, toRecruitment } from '@/domains/pods/data/podWaiting';
import type { MyPodApplication } from '@/domains/auth/users.types';

type PodWaitingPageProps = {
  pods: MyPodApplication[];
  initialSelectedIds: string[];
};

export default function PodWaitingPage({
  pods,
  initialSelectedIds,
}: PodWaitingPageProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [paymentError, setPaymentError] = useState('');

  const summary = summarize(pods, selectedIds);
  const selectedPods = pods.filter((pod) => selectedIds.includes(pod.podId));

  function handlePayment() {
    setPaymentError('');

    const saved = saveSelectedPodIds(selectedIds);

    if (!saved) {
      setPaymentError('Could not save your selected groups. Please try again.');
      return;
    }

    router.push('/payment');
  }

  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Your group is ready!</h1>

        <p className="mt-2">
          Your group is full. Review your order and pay for your share.
        </p>
      </header>

      {pods.length > 0 ? (
        <>
          <PodProgress status="matched" />

          <div className="mt-8 grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0">
              <h2 className="mb-6 text-2xl font-bold">Group progress</h2>

              <div className="flex flex-col gap-6">
                {pods.map((pod) => {
                  const checked = selectedIds.includes(pod.podId);

                  return (
                    <div key={pod.podId}>
                      <label className="flex cursor-pointer items-center gap-2 font-bold">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedIds((prev) =>
                              event.target.checked
                                ? [...prev, pod.podId]
                                : prev.filter((id) => id !== pod.podId),
                            )
                          }
                        />
                        <span>Select {foodLabel(pod.productName)}</span>
                      </label>
                      <div className="mt-3">
                        <PodStatusCard {...toRecruitment(pod)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="min-[1260px]:sticky min-[1260px]:top-24">
              <h2 className="mb-6 text-2xl font-bold">My order details</h2>

              <PodApplicationSummary
                items={selectedPods}
                totalPrice={summary.totalPrice}
                onPayment={handlePayment}
              />

              {paymentError && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {paymentError}
                </p>
              )}
            </aside>
          </div>
        </>
      ) : (
        <EmptyState title="No groups ready for payment.">
          <Button
            type="button"
            variant="actionOutline"
            size="touch"
            className="min-h-10 w-full py-2"
            render={<Link href="/mypage/pods">My buying groups</Link>}
          />
        </EmptyState>
      )}
    </main>
  );
}
