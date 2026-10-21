import type { ReactNode } from 'react';

export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lp-route-theme w-full lg:mx-[150px] lg:w-[calc(100%_-_300px)]">
      {children}
    </div>
  );
}
