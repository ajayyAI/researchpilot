export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen px-6 pt-16">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center">
        <section className="w-full space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-full bg-bg-elevated" />
            <div className="h-10 w-full max-w-xl animate-pulse rounded-2xl bg-bg-elevated" />
            <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-bg-surface" />
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="h-3 w-40 animate-pulse rounded-full bg-bg-elevated" />
            <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-bg-elevated" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-bg-primary" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-bg-primary" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-bg-primary" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
