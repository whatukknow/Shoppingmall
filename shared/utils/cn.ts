import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부 클래스명을 합치고 Tailwind 유틸리티 충돌을 정리합니다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
