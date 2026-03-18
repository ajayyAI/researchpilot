import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="mx-auto max-w-4xl px-6">
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <div className="size-7 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="size-2 rounded-full bg-white" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">
            ResearchPilot
          </span>
        </Link>
      </div>
    </header>
  );
}
