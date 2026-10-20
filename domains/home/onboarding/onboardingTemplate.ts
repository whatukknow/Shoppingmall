import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function getOnboardingTemplate() {
  return readFile(
    path.join(process.cwd(), 'domains/home/onboarding/han-kki-saju.html'),
    'utf8',
  );
}
