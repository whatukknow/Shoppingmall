import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type HomeRecommendationStatus,
  resolveHomeRecommendationMode,
  loadHomeRecommendations,
} from '../../domains/home/data/homeRecommendations';

describe('resolveHomeRecommendationMode', () => {
  it('returns random when logged out regardless of taste profile', () => {
    const status: HomeRecommendationStatus = {
      isLoggedIn: false,
      hasTasteProfile: true,
    };

    assert.equal(resolveHomeRecommendationMode(status), 'random');
  });

  it('returns ai when logged in with taste profile', () => {
    const status: HomeRecommendationStatus = {
      isLoggedIn: true,
      hasTasteProfile: true,
    };

    assert.equal(resolveHomeRecommendationMode(status), 'ai');
  });

  it('returns random when logged in without taste profile', () => {
    const status: HomeRecommendationStatus = {
      isLoggedIn: true,
      hasTasteProfile: false,
    };

    assert.equal(resolveHomeRecommendationMode(status), 'random');
  });
});

describe('메인 추천 캐러셀 데이터 분기', () => {
  const random = [{ id: 'raw-01', name: '합성 랜덤 상품', imageUrl: '' }];
  it('미저장·비로그인은 AI 조회 없이 같은 캐러셀의 랜덤 목록을 사용한다', async () => {
    for (const status of [
      { isLoggedIn: false, hasTasteProfile: false },
      { isLoggedIn: true, hasTasteProfile: false },
    ]) {
      const response = await loadHomeRecommendations(status, {
        ai: async () => {
          throw new Error('호출하면 안 됨');
        },
        random: async () => random,
      });
      assert.equal(response.mode, 'random');
      assert.equal(response.products[0].id, 'raw-01');
    }
  });
  it('저장된 유효 추천은 랜덤 조회 없이 순서와 기존 이미지 역할을 유지한다', async () => {
    const response = await loadHomeRecommendations(
      { isLoggedIn: true, hasTasteProfile: true },
      {
        ai: async () => [{ id: 'raw-02', name: '', imageUrl: '' }, ...random],
        random: async () => {
          throw new Error('호출하면 안 됨');
        },
      },
    );
    assert.equal(response.mode, 'ai');
    assert.deepEqual(
      response.products.map((p) => p.id),
      ['raw-02', 'raw-01'],
    );
    assert.ok(
      response.products.every((p) =>
        p.imageUrl.startsWith('/uploads/catalog/'),
      ),
    );
  });
  it('빈 추천과 현재 카탈로그에 없는 과거 추천 모두 랜덤으로 대체한다', async () => {
    for (const aiProducts of [
      [],
      [{ id: 'pc-101', name: '스테이크용 소고기', imageUrl: '' }],
    ]) {
      const response = await loadHomeRecommendations(
        { isLoggedIn: true, hasTasteProfile: true },
        { ai: async () => aiProducts, random: async () => random },
      );
      assert.equal(response.mode, 'random');
      assert.deepEqual(
        response.products.map((p) => p.id),
        ['raw-01'],
      );
    }
  });
  it('추천·랜덤 조회 장애는 미저장으로 위장하지 않는다', async () => {
    await assert.rejects(
      loadHomeRecommendations(
        { isLoggedIn: true, hasTasteProfile: true },
        {
          ai: async () => {
            throw new Error('추천 장애');
          },
          random: async () => random,
        },
      ),
      /추천 장애/,
    );
    await assert.rejects(
      loadHomeRecommendations(
        { isLoggedIn: false, hasTasteProfile: false },
        {
          ai: async () => [],
          random: async () => {
            throw new Error('랜덤 장애');
          },
        },
      ),
      /랜덤 장애/,
    );
  });
});
