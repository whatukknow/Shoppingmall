import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { signIn, signOut, signUp } from '../../domains/auth/auth.api';
import { waitMockDelay } from '../../shared/lib/mock/mockDelay';

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
