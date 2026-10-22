import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../../shared/lib/client';
import {
  getProductPods,
  createPod,
  applyPod,
  cancelPodApplication,
} from '../../domains/pods/pods.api';
import type { Pod } from '../../domains/pods/pods.types';

function assertPodShape(pod: Pod): void {
  assert.equal(typeof pod.id, 'string');
  assert.equal(typeof pod.productName, 'string');
  assert.equal(typeof pod.imageUrl, 'string');
  assert.equal(typeof pod.optionLabel, 'string');
  assert.equal(typeof pod.currentCount, 'number');
  assert.equal(typeof pod.targetCount, 'number');
  assert.equal(typeof pod.deadlineLabel, 'string');
  assert.ok(pod.status === 'open' || pod.status === 'close');
}

describe('pods api (mock)', () => {
  it('returns pod list for a product with expected field types', async () => {
    const response = await getProductPods('pc-001');

    assert.ok(response.list.length >= 2);
    assert.equal(typeof response.total, 'number');
    for (const pod of response.list) assertPodShape(pod);
  });

  it('sorts pods by deadline (deadline-ascending) in the all list', async () => {
    const response = await getProductPods('pc-001');

    const order = ['오늘 마감', 'D-1', 'D-2', 'D-3'];
    const indexes = response.list.map((pod) =>
      order.indexOf(pod.deadlineLabel),
    );
    for (let i = 1; i < indexes.length; i += 1) {
      assert.ok(indexes[i - 1] <= indexes[i]);
    }
  });

  it('filters only open pods when status=open', async () => {
    const all = await getProductPods('pc-002', { status: 'open' });

    assert.ok(all.list.length > 0);
    for (const pod of all.list) assert.equal(pod.status, 'open');
  });

  it('includes both open and close pods in the all list', async () => {
    const { list } = await getProductPods('pc-003', { status: 'all' });

    assert.ok(list.some((pod) => pod.status === 'open'));
    assert.ok(list.some((pod) => pod.status === 'close'));
  });

  it('creates a pod with currentCount 1', async () => {
    const pod = await createPod('pc-001', {
      targetCount: 6,
      deadline: '2026-11-01',
    });

    // 확정 목업 계약: 생성 응답은 새 팟 하나, currentCount 1
    assertPodShape(pod);
    assert.equal(pod.id, 'pp-001-new');
    assert.equal(pod.currentCount, 1);
    assert.equal(pod.status, 'open');
    assert.equal(pod.productName, '달콤한 참외');
  });

  it('applies to a pod and increments currentCount', async () => {
    const before = await getProductPods('pc-002', { status: 'all' });
    const target = before.list[0];

    const after = await applyPod(target.id);

    assertPodShape(after);
    assert.equal(after.id, target.id);
    assert.equal(after.currentCount, target.currentCount + 1);
  });

  it('cancels an application and decrements currentCount', async () => {
    const before = await getProductPods('pc-002', { status: 'all' });
    const target = before.list[0];

    // 확정 목업 계약: 취소는 팟의 원래 currentCount - 1 을 응답
    const cancelled = await cancelPodApplication(target.id);

    assertPodShape(cancelled);
    assert.equal(cancelled.id, target.id);
    assert.equal(cancelled.currentCount, Math.max(0, target.currentCount - 1));
  });

  it('throws ApiError 404 for an unknown product', async () => {
    await assert.rejects(
      () => getProductPods('pc-999'),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  });
});
