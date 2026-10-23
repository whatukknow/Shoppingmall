import type { NextRequest } from 'next/server';
import { updateSession } from '@/shared/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * static 파일, 이미지 최적화, favicon, 업로드 이미지는 제외합니다.
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
