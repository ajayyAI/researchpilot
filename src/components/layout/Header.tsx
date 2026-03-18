import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/"
          aria-label="ResearchPilot home"
          className="group flex w-fit items-center gap-2.5"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-accent/90 shadow-[0_10px_30px_rgba(217,119,6,0.22)] transition-transform group-hover:scale-105">
            <div className="flex size-4 items-center justify-center rounded-full border border-white/35">
              <div className="size-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">
            ResearchPilot
          </span>
        </Link>
      </div>
    </header>
  );
}
