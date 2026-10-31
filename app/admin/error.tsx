'use client';
export default function AdminErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="lp-admin lp-admin-access">
      <h1>We could not load the back office.</h1>
      <p>Please retry. Your saved data has not been replaced.</p>
      <button onClick={reset} className="lp-admin-button">
        Try again
      </button>
    </div>
  );
}
