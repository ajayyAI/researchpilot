import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-text-primary">404</h1>
        <p className="text-base text-text-secondary">Page not found.</p>
        <Link
          href="/"
          className="inline-block text-sm text-accent hover:underline underline-offset-4"
        >
          Back to ResearchPilot
        </Link>
      </div>
    </section>
  );
}
