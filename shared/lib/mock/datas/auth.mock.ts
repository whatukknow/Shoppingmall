// 목업 등록부: 'METHOD path' 키에 JSON 문자열 응답 (GET·POST 지원)
export const authData: Record<`${'GET' | 'POST'} ${string}`, string> = {
  'POST auth/signin': JSON.stringify({
    data: {
      id: 'member-1',
      name: '정은',
      email: 'jeongeun@example.com',
      defaultAddress: null,
      hasTasteProfile: true,
      expiresAt: '2026-11-01T00:00:00.000Z',
      requestId: 'req-signin-1',
    },
  }),
  'POST auth/signout': JSON.stringify({
    data: { signedOut: true, requestId: 'req-signout-1' },
  }),
  'POST auth/signup': JSON.stringify({
    data: {
      id: 'member-1',
      name: '정은',
      email: 'jeongeun@example.com',
      termsVersion: '2026-10',
      privacyVersion: '2026-10',
      agreeTerms: true,
      agreePrivacy: true,
      agreeNotification: false,
    },
  }),
};
