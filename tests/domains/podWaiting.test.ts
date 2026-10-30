import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  initialSelection,
  summarize,
  toRecruitment,
} from '../../domains/pods/data/podWaiting';
import type { MyPodApplication } from '../../domains/auth/users.types';

function app(overrides: Partial<MyPodApplication> = {}): MyPodApplication {
  return {
    id: 'pa-1',
    podId: 'pod-1',
    productId: 'pc-105',
    productName: '용인 블루베리',
    optionLabel: '1팩 · 125g',
    imageUrl: null,
    quantity: 1,
    unitPrice: 4900,
    status: 'accepted',
    paymentEligibility: 'ready',
    podStatus: 'matched',
    applicantCount: 3,
    capacity: 3,
    deadlineAt: '2026-10-21T18:00:00+09:00',
    appliedAt: '2026-10-20T14:00:00',
    ...overrides,
  };
}

describe('podWaiting (결제 가능 내 팟 선택)', () => {
  it('initialSelection: selectedId 가 목록에 있으면 그것만 선택한다', () => {
    const pods = [app({ podId: 'pod-1' }), app({ podId: 'pod-2', id: 'pa-2' })];

    assert.deepEqual(initialSelection(pods, 'pod-2'), ['pod-2']);
  });

  it('initialSelection: selectedId 가 없으면 전체를 선택한다', () => {
    const pods = [app({ podId: 'pod-1' }), app({ podId: 'pod-2', id: 'pa-2' })];

    assert.deepEqual(initialSelection(pods, undefined), ['pod-1', 'pod-2']);
  });

  it('initialSelection: selectedId 가 목록에 없으면 전체를 선택한다', () => {
    const pods = [app({ podId: 'pod-1' }), app({ podId: 'pod-2', id: 'pa-2' })];

    assert.deepEqual(initialSelection(pods, 'pod-99'), ['pod-1', 'pod-2']);
  });

  it('summarize: 선택된 podId 의 개수와 합계(수량×단가)를 계산한다', () => {
    const pods = [
      app({ podId: 'pod-1', quantity: 2, unitPrice: 5000 }),
      app({ podId: 'pod-2', id: 'pa-2', quantity: 1, unitPrice: 7900 }),
    ];

    assert.deepEqual(summarize(pods, ['pod-1']), {
      count: 1,
      totalPrice: 10000,
    });
    assert.deepEqual(summarize(pods, ['pod-1', 'pod-2']), {
      count: 2,
      totalPrice: 17900,
    });
  });

  it('summarize: 선택이 비면 개수와 합계는 0 이다', () => {
    const pods = [app()];

    assert.deepEqual(summarize(pods, []), { count: 0, totalPrice: 0 });
    assert.deepEqual(summarize(pods, ['없는id']), { count: 0, totalPrice: 0 });
  });

  it('toRecruitment: 모집 현황 카드를 그린다 (status 는 항상 matched)', () => {
    const recruitment = toRecruitment(app({ applicantCount: 3, capacity: 3 }));

    assert.equal(recruitment.productName, '용인 블루베리');
    assert.equal(recruitment.optionLabel, '1팩 · 125g');
    assert.equal(recruitment.currentCount, 3);
    assert.equal(recruitment.targetCount, 3);
    assert.equal(recruitment.status, 'matched');
  });

  it('toRecruitment: deadlineAt 을 M월 D일 오전/오후 h시 문자열로 바꾼다', () => {
    assert.equal(
      toRecruitment({ ...app(), deadlineAt: '2026-10-21T18:00:00+09:00' })
        .deadlineLabel,
      'Oct 21, 6 PM KST',
    );
    assert.equal(
      toRecruitment({ ...app(), deadlineAt: '2026-10-24T09:00:00+09:00' })
        .deadlineLabel,
      'Oct 24, 9 AM KST',
    );
    assert.equal(
      toRecruitment({ ...app(), deadlineAt: '2026-11-02T00:00:00+09:00' })
        .deadlineLabel,
      'Nov 2, 12 AM KST',
    );
  });
});
