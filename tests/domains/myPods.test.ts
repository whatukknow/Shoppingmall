import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterMyPods, getMyPodView } from '../../domains/pods/data/myPods';
import type { MyPodApplication } from '../../domains/auth/users.types';

// 테스트용 신청 1건 만들기
function makeApp(overrides: Partial<MyPodApplication> = {}): MyPodApplication {
  return {
    id: 'app-1',
    podId: 'pod-1',
    productId: 'product-1',
    productName: '방울토마토',
    optionLabel: '2kg',
    imageUrl: null,
    quantity: 2,
    unitPrice: 8000,
    status: 'accepted',
    paymentEligibility: 'not-ready',
    podStatus: 'recruiting',
    applicantCount: 1,
    capacity: 4,
    deadlineAt: '2026-10-30T00:00:00Z',
    appliedAt: '2026-10-20T00:00:00Z',
    ...overrides,
  };
}

describe('filterMyPods', () => {
  const list = [
    makeApp({ id: 'a1' }), // recruiting 기본값
    makeApp({
      id: 'a2',
      paymentEligibility: 'ready',
      podStatus: 'matched',
    }),
    makeApp({ id: 'a3', podStatus: 'closed' }),
    makeApp({ id: 'a4', paymentEligibility: 'paid', podStatus: 'matched' }),
  ];

  it('all 탭은 전부 돌려준다', () => {
    assert.equal(filterMyPods(list, 'all').length, 4);
  });

  it('recruiting 탭은 모집 중 + 결제 준비 안 된 것만 돌려준다', () => {
    const result = filterMyPods(list, 'recruiting');
    assert.deepEqual(
      result.map((app) => app.id),
      ['a1'],
    );
  });

  it('payable 탭은 결제 가능한 것만 돌려준다', () => {
    const result = filterMyPods(list, 'payable');
    assert.deepEqual(
      result.map((app) => app.id),
      ['a2'],
    );
  });
});

describe('getMyPodView', () => {
  it('결제 가능하면 매칭 완료 · 결제 가능 + 결제하기(primary)', () => {
    const view = getMyPodView(
      makeApp({ paymentEligibility: 'ready', podStatus: 'matched' }),
    );
    assert.equal(view.statusLabel, '매칭 완료 · 결제 가능');
    assert.deepEqual(view.actions, [
      {
        label: '결제하기',
        primary: true,
        pay: true,
      },
    ]);
  });

  it('모집 중이면 모집 중 · 내 신청 대기 + 상세 보기/내 신청 취소', () => {
    const view = getMyPodView(makeApp());
    assert.equal(view.statusLabel, '모집 중 · 내 신청 대기');
    assert.deepEqual(view.actions, [
      { label: '상세 보기', href: '/pods/product/product-1' },
      { label: '내 신청 취소', cancel: true },
    ]);
  });

  it('결제 완료면 상태 표시 + 상세 보기만', () => {
    const view = getMyPodView(
      makeApp({ paymentEligibility: 'paid', podStatus: 'matched' }),
    );
    assert.equal(view.statusLabel, '결제 완료');
    assert.deepEqual(view.actions, [
      { label: '상세 보기', href: '/pods/product/product-1' },
    ]);
  });

  it('결제 기한 만료면 상태 표시 + 상세 보기만', () => {
    const view = getMyPodView(
      makeApp({ paymentEligibility: 'expired', podStatus: 'matched' }),
    );
    assert.equal(view.statusLabel, '결제 기한 만료');
    assert.deepEqual(view.actions, [
      { label: '상세 보기', href: '/pods/product/product-1' },
    ]);
  });

  it('모집 마감이면 모집 마감 + 상세 보기만', () => {
    const view = getMyPodView(makeApp({ podStatus: 'closed' }));
    assert.equal(view.statusLabel, '모집 마감');
    assert.deepEqual(view.actions, [
      { label: '상세 보기', href: '/pods/product/product-1' },
    ]);
  });

  it('모집 취소면 모집 취소 + 상세 보기만', () => {
    const view = getMyPodView(makeApp({ podStatus: 'cancelled' }));
    assert.equal(view.statusLabel, '모집 취소');
    assert.deepEqual(view.actions, [
      { label: '상세 보기', href: '/pods/product/product-1' },
    ]);
  });
});
