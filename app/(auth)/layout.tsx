import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full lg:mx-[150px] lg:w-[calc(100%_-_300px)]">
      {children}
    </div>
  );
}
