import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildTasteProfile } from '../../domains/home/onboarding/react/tasteProfile';
import { toTasteProfileRequest } from '../../domains/auth/users.api';
import { initialAnswers } from '../../domains/home/onboarding/react/answers';
import { recommend } from '../../domains/home/onboarding/react/recommendation';

describe('buildTasteProfile', () => {
  const answers = {
    ...initialAnswers,
    nick: '늦잠러',
    y: 1990,
    m: 3,
    d: 7,
    g: 'f' as const,
    sun: 'p' as const,
    fridge: 'sauce' as const,
  };
  const result = recommend(answers);

  it('maps fields from answers and result', () => {
    const profile = buildTasteProfile({
      answers,
      result,
      nickname: '결과닉',
      consent: true,
    });

    assert.equal(profile.source, 'onboarding');
    assert.equal(profile.variant, 'react-v1');
    assert.equal(profile.nickname, '결과닉');
    assert.equal(profile.birthYear, '1990');
    assert.equal(profile.birthMd, '0307');
    assert.equal(profile.gender, 'f');
    assert.equal(profile.animal, result.z.animal);
    assert.equal(profile.element, result.z.el);
    assert.equal(profile.sunday, 'p');
    assert.equal(profile.fridge, 'sauce');
    assert.equal(profile.items, JSON.stringify(result.items));
    assert.equal(profile.kit, JSON.stringify(result.kit));
    assert.equal(profile.consent, true);
    assert.equal(profile.qualityFlags, '[]');
  });

  it('pads month and day to two digits', () => {
    const profile = buildTasteProfile({
      answers: { ...answers, m: 3, d: 7 },
      result,
      nickname: 'n',
      consent: false,
    });
    assert.equal(profile.birthMd, '0307');

    const profile2 = buildTasteProfile({
      answers: { ...answers, m: 12, d: 25 },
      result,
      nickname: 'n',
      consent: false,
    });
    assert.equal(profile2.birthMd, '1225');
  });

  it('falls back to defaults for null sunday and fridge', () => {
    const profile = buildTasteProfile({
      answers: { ...answers, sun: null, fridge: null },
      result,
      nickname: 'n',
      consent: false,
    });
    assert.equal(profile.sunday, 'b');
    assert.equal(profile.fridge, 'empty');
  });

  it('serializes items and kit as JSON strings via toTasteProfileRequest', () => {
    const profile = buildTasteProfile({
      answers,
      result,
      nickname: '결과닉',
      consent: true,
    });
    const request = toTasteProfileRequest(profile);

    assert.deepEqual(Object.keys(request), [
      'source',
      'variant',
      'nickname',
      'birth_year',
      'birth_md',
      'gender',
      'animal',
      'element',
      'sunday',
      'fridge',
      'items',
      'kit',
      'consent',
      'quality_flags',
    ]);
    assert.equal(request.birth_year, '1990');
    assert.equal(request.birth_md, '0307');
    assert.deepEqual(JSON.parse(request.items), result.items);
    assert.deepEqual(JSON.parse(request.kit), result.kit);
    assert.deepEqual(JSON.parse(request.quality_flags), []);
  });
});
