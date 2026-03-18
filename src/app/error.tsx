"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-6 pt-16"
    >
      <section className="surface max-w-lg rounded-2xl p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-error">
          Application error
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          Something broke while rendering this page.
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          Retry the route. If the problem persists, refresh the session and
          check the server logs for the associated error digest.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-lg border border-border bg-bg-primary px-3 py-2 font-mono text-xs text-text-muted">
            Error digest: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Retry
          </button>
          <a
            href="/"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated"
          >
            Go home
          </a>
        </div>
      </section>
    </main>
  );
}
