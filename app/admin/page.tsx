import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { requireAdmin } from '@/domains/admin/admin.server';
import { AdminError } from '@/domains/admin/access';
import { AdminConsole } from '@/domains/admin/AdminConsole';

async function AuthorizedConsole() {
  await connection();
  try {
    await requireAdmin();
  } catch (error) {
    if (!(error instanceof AdminError)) throw error;
    return (
      <div className="lp-admin lp-admin-access">
        <p className="lp-admin-eyebrow">LITTLE PORTIONS / ADMIN</p>
        <h1>
          {error.status === 401
            ? 'Welcome back.'
            : 'Administrator access required.'}
        </h1>
        <p>{error.message}</p>
        <Link href="/login?next=%2Fadmin" className="lp-admin-button">
          Log in
        </Link>
        <Link href="/" className="lp-admin-text-link">
          Return to the shop
        </Link>
      </div>
    );
  }
  return <AdminConsole />;
}
export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="lp-admin lp-admin-access" role="status">
          Checking administrator access…
        </div>
      }
    >
      <AuthorizedConsole />
    </Suspense>
  );
}
