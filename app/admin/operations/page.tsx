import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { requireAdmin } from '@/domains/admin/admin.server';
import { AdminError } from '@/domains/admin/access';
import { OperationsConsole } from '@/domains/admin/OperationsConsole';
async function AuthorizedOperations() {
  await connection();
  try {
    await requireAdmin();
  } catch (error) {
    if (!(error instanceof AdminError)) throw error;
    return (
      <div className="lp-admin lp-admin-access">
        <h1>Administrator access required</h1>
        <p>{error.message}</p>
        <Link
          className="lp-admin-button"
          href="/login?next=%2Fadmin%2Foperations"
        >
          Log in
        </Link>
      </div>
    );
  }
  return <OperationsConsole />;
}
export default function OperationsPage() {
  return (
    <Suspense
      fallback={
        <div className="lp-admin lp-admin-access" role="status">
          Checking administrator access…
        </div>
      }
    >
      <AuthorizedOperations />
    </Suspense>
  );
}
