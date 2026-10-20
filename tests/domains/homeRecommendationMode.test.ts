import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type HomeRecommendationStatus,
  resolveHomeRecommendationMode,
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

  it('returns needs-taste when logged in without taste profile', () => {
    const status: HomeRecommendationStatus = {
      isLoggedIn: true,
      hasTasteProfile: false,
    };

    assert.equal(resolveHomeRecommendationMode(status), 'needs-taste');
  });
});
