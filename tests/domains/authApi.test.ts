import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { signIn, signOut, signUp } from '../../domains/auth/auth.api';
import { loginErrorMessage } from '../../domains/auth/containers/LoginContainer';
import { ApiError } from '../../shared/lib/client';
import { waitMockDelay } from '../../shared/lib/mock/mockDelay';
import { AuthApiError } from '../../domains/auth/auth.server';
import { getMastHeadUser } from '../../app/_lib/masthead-user';
import type { User } from '../../domains/auth/users.types';

const userFixture: User = {
  id: 'user-1',
  name: '정은',
  email: 'user@example.com',
  defaultAddress: '',
  recipientName: '',
  recipientPhone: '',
  postalCode: '',
  recipientAddress: '',
  recipientAddressDetail: '',
  entranceInstructions: '',
  hasTasteProfile: false,
};

describe('auth api (mock)', () => {
  it('signIn returns SignInResponse shape', async () => {
    const { data } = await signIn({
      email: 'jeongeun@example.com',
      password: 'password123!',
    });

    assert.equal(typeof data.id, 'string');
    assert.equal(typeof data.name, 'string');
    assert.equal(typeof data.email, 'string');
    assert.ok(
      data.defaultAddress === null || typeof data.defaultAddress === 'string',
    );
    assert.equal(typeof data.hasTasteProfile, 'boolean');
    assert.equal(typeof data.expiresAt, 'string');
    assert.equal(typeof data.requestId, 'string');
  });

  it('signOut returns SignOutResponse shape', async () => {
    const { data } = await signOut();

    assert.equal(typeof data.signedOut, 'boolean');
    assert.equal(typeof data.requestId, 'string');
  });

  it('signUp returns SignUpResponse shape without password', async () => {
    const { data } = await signUp({
      name: '정은',
      email: 'jeongeun@example.com',
      password: 'password123!',
      termsVersion: '2026-10',
      privacyVersion: '2026-10',
      agreeTerms: true,
      agreePrivacy: true,
      agreeNotification: false,
    });

    assert.equal(typeof data.id, 'string');
    assert.equal(typeof data.name, 'string');
    assert.equal(typeof data.email, 'string');
    assert.equal(typeof data.termsVersion, 'string');
    assert.equal(typeof data.privacyVersion, 'string');
    assert.equal(typeof data.agreeTerms, 'boolean');
    assert.equal(typeof data.agreePrivacy, 'boolean');
    assert.equal(typeof data.agreeNotification, 'boolean');
    assert.equal('password' in data, false);
    assert.equal('requestId' in data, false);
  });
});

describe('waitMockDelay', () => {
  it('waits at least the given milliseconds', async () => {
    const start = Date.now();
    await waitMockDelay(50);
    assert.ok(Date.now() - start >= 50);
  });

  it('resolves immediately for zero delay', async () => {
    const start = Date.now();
    await waitMockDelay(0);
    assert.ok(Date.now() - start < 50);
  });
});

describe('loginErrorMessage', () => {
  it('returns the fixed message for a 401 ApiError', () => {
    const error = new ApiError(
      401,
      'HTTP_ERROR',
      '이메일 또는 비밀번호가 올바르지 않아요.',
    );
    assert.equal(
      loginErrorMessage(error),
      '이메일과 비밀번호가 일치하지 않습니다.',
    );
  });

  it('returns the ApiError message for other ApiError statuses', () => {
    const error = new ApiError(
      429,
      'HTTP_ERROR',
      '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    );
    assert.equal(
      loginErrorMessage(error),
      '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    );
  });

  it('returns the fallback message for unknown errors', () => {
    assert.equal(
      loginErrorMessage(new Error('boom')),
      '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
    );
    assert.equal(
      loginErrorMessage(undefined),
      '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
    );
  });
});

// ── getMastHeadUser (레이아웃 → MastHead user 매핑) ──
describe('getMastHeadUser', () => {
  it('getMe 성공이면 { name } 을 반환한다', async () => {
    const result = await getMastHeadUser(async () => userFixture);
    assert.deepEqual(result, { name: '정은' });
  });

  it('getMe 가 AuthApiError 401 (비로그인) 이면 콘솔 없이 null 을 반환한다', async () => {
    const errors: unknown[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      const result = await getMastHeadUser(async () => {
        throw new AuthApiError(401, '로그인이 필요합니다.');
      });
      assert.equal(result, null);
      assert.equal(errors.length, 0);
    } finally {
      console.error = originalError;
    }
  });

  it('getMe 가 401 외 오류면 console.error 를 남기고 null 을 반환한다', async () => {
    const calls: unknown[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      calls.push(args);
    };
    try {
      const result = await getMastHeadUser(async () => {
        throw new Error('network down');
      });
      assert.equal(result, null);
      assert.equal(calls.length, 1);
    } finally {
      console.error = originalError;
    }
  });
});
