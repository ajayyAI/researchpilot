"use client";

export default function AppGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary px-6 text-text-primary antialiased">
        <main className="flex min-h-screen items-center justify-center">
          <section className="surface max-w-lg rounded-2xl p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-error">
              Fatal error
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              The application shell failed to render.
            </h1>
            <p className="mt-3 text-base text-text-secondary">
              This error happened outside the normal route boundary. Retry once,
              then inspect the server logs if it repeats.
            </p>
            {error.digest ? (
              <p className="mt-4 rounded-lg border border-border bg-bg-primary px-3 py-2 font-mono text-xs text-text-muted">
                Error digest: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Retry application
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
