import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="ResearchPilot home"
          className="group flex w-fit items-center gap-2.5"
        >
          <div className="overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(217,119,6,0.22)] transition-transform group-hover:scale-105">
            <Image
              src="/icon-192.png"
              alt=""
              width={36}
              height={36}
              className="size-9"
              priority
            />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">
            ResearchPilot
          </span>
        </Link>
        <a
          href={siteConfig.githubUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="View ResearchPilot on GitHub"
          className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-bg-elevated/80 text-text-secondary shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
        >
          <Github className="size-5" />
        </a>
      </div>
    </header>
  );
}
