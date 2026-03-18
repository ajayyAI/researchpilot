import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-6 pt-16"
    >
      <section className="surface max-w-lg rounded-2xl p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-text-primary">
          That route doesn&apos;t exist.
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          The page may have moved, or the URL may be incorrect. Return to the
          research workspace to start a new session.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Back to ResearchPilot
        </Link>
      </section>
    </main>
  );
}
