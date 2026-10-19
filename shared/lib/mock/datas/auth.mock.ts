import { myProfileMock } from '@/domains/auth/data/auth.mock';

export const authData: Record<`GET ${string}`, string> = {
  'GET auth/me': JSON.stringify(myProfileMock),
};
