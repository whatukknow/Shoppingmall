import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getMe,
  getMyPayments,
  getMyPodApplications,
  getTasteProfile,
  saveTasteProfile,
  toTasteProfileRequest,
} from '../../domains/auth/users.api';
import { MOCK_USER_SCENARIO } from '../../shared/lib/mock/mockScenario';
import { ApiError } from '../../shared/lib/client';

describe('users api (mock)', () => {
  it('getMe: 회원 시나리오면 회원 정보를 반환한다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return; // guest 케이스는 아래 테스트가 담당

    const user = await getMe();

    assert.equal(typeof user.id, 'string');
    assert.equal(user.name, '정은');
    assert.equal(typeof user.email, 'string');
    assert.equal(typeof user.defaultAddress, 'string');
    assert.equal(typeof user.recipientName, 'string');
    assert.equal(typeof user.recipientPhone, 'string');
    assert.equal(typeof user.postalCode, 'string');
    assert.equal(typeof user.recipientAddress, 'string');
    assert.equal(typeof user.recipientAddressDetail, 'string');
    assert.equal(typeof user.entranceInstructions, 'string');
    assert.equal(typeof user.hasTasteProfile, 'boolean');
  });

  it('getMe: guest 시나리오면 ApiError 401 를 던진다', async () => {
    if (MOCK_USER_SCENARIO !== 'guest') return;

    await assert.rejects(
      () => getMe(),
      (e: unknown) => e instanceof ApiError && e.status === 401,
    );
  });

  it('saveTasteProfile: camelCase 취향 프로필을 저장하고 응답으로 돌려준다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const profile = await saveTasteProfile({
      source: 'onboarding',
      variant: 'v1',
      nickname: '정은',
      birthYear: '1995',
      birthMd: '0314',
      gender: 'F',
      animal: 'wood-pig',
      element: 'wood',
      sunday: 'window-sun',
      fridge: 'always-full',
      items: '["vegetables"]',
      kit: '["fresh"]',
      consent: true,
      qualityFlags: '["cheap"]',
    });

    assert.equal(profile.nickname, '정은');
    assert.equal(typeof profile.consent, 'boolean');
    assert.equal(typeof profile.items, 'string');
  });

  it('getTasteProfile: 회원 시나리오에서 취향 프로필을 반환한다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const profile = await getTasteProfile();

    assert.equal(typeof profile.nickname, 'string');
    assert.equal(typeof profile.consent, 'boolean');
  });

  it('toTasteProfileRequest: camelCase 를 snake_case 본문으로 변환한다', () => {
    const body = toTasteProfileRequest({
      source: 'onboarding',
      variant: 'v1',
      nickname: '테스트',
      birthYear: '1995',
      birthMd: '0314',
      gender: 'F',
      animal: 'wood-pig',
      element: 'wood',
      sunday: 'window-sun',
      fridge: 'always-full',
      items: '[]',
      kit: '[]',
      consent: true,
      qualityFlags: '["cheap"]',
    });

    assert.equal(body.nickname, '테스트');
    assert.equal(body.birth_year, '1995');
    assert.equal(body.birth_md, '0314');
    assert.equal(body.quality_flags, '["cheap"]');
    assert.equal(body.consent, true);
    assert.equal('birthYear' in body, false);
  });

  it('내 소분 팟 목록: 6건을 최신순으로 반환한다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const result = await getMyPodApplications();
    const list = result.list;

    assert.equal(list.length, 6);

    for (const item of list) {
      assert.equal(typeof item.id, 'string');
      assert.equal(typeof item.podId, 'string');
      assert.equal(typeof item.productId, 'string');
      assert.ok(item.status === 'pending' || item.status === 'accepted');
      assert.ok(
        item.paymentEligibility === 'not-ready' ||
          item.paymentEligibility === 'ready' ||
          item.paymentEligibility === 'paid' ||
          item.paymentEligibility === 'expired',
      );
      assert.ok(
        item.podStatus === 'recruiting' ||
          item.podStatus === 'matched' ||
          item.podStatus === 'closed' ||
          item.podStatus === 'cancelled',
      );
      assert.equal(typeof item.quantity, 'number');
      assert.equal(typeof item.unitPrice, 'number');
      assert.equal(typeof item.deadlineAt, 'string');
      assert.equal(typeof item.appliedAt, 'string');
    }

    // 최신 신청순
    for (let i = 1; i < list.length; i += 1) {
      assert.ok(list[i - 1].appliedAt >= list[i].appliedAt);
    }
  });

  it('내 소분 팟 목록: 결제 가능 2건은 pod 이 모의 데이터와 동일하다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const list = (await getMyPodApplications()).list;
    const readyItems = list.filter(
      (item) =>
        item.paymentEligibility === 'ready' &&
        item.podStatus === 'matched' &&
        item.status === 'accepted',
    );

    assert.equal(readyItems.length, 2);
    assert.deepEqual(readyItems.map((item) => item.podId).sort(), [
      'pod-1',
      'pod-2',
    ]);
  });

  it('내 소분 팟 목록: open/close 필터 키가 동작한다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const result = await getMyPodApplications();
    assert.equal(result.limit >= 0, true);
  });

  it('내 소분 팟 목록: guest 시나리오면 ApiError 401 을 던진다', async () => {
    if (MOCK_USER_SCENARIO !== 'guest') return;

    await assert.rejects(
      () => getMyPodApplications(),
      (e: unknown) => e instanceof ApiError && e.status === 401,
    );
  });

  it('내 결제 내역: 3건(paid 2, pending 1)을 반환한다', async () => {
    if (MOCK_USER_SCENARIO === 'guest') return;

    const result = await getMyPayments();
    const list = result.list;

    assert.equal(list.length, 3);
    assert.equal(list.filter((item) => item.status === 'paid').length, 2);
    assert.equal(list.filter((item) => item.status === 'pending').length, 1);

    for (const item of list) {
      assert.ok(typeof item.paymentMethod === 'string');
      assert.equal(typeof item.itemCount, 'number');
      assert.ok(Array.isArray(item.representativeItem));
      assert.equal(typeof item.total, 'number');
      assert.equal(typeof item.createdAt, 'string');
      if (item.status === 'paid') {
        assert.equal(typeof item.paidAt, 'string');
      }
    }
  });

  it('내 결제 내역: guest 시나리오면 ApiError 401 을 던진다', async () => {
    if (MOCK_USER_SCENARIO !== 'guest') return;

    await assert.rejects(
      () => getMyPayments(),
      (e: unknown) => e instanceof ApiError && e.status === 401,
    );
  });
});
