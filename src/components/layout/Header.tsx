"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isResearch = pathname === "/research";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 mt-4">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30 group-hover:scale-110 transition-transform duration-300">
              <div className="size-3 rounded-full bg-electric-blue shadow-[0_0_10px_rgba(41,98,255,0.5)]" />
            </div>
            <span className="font-semibold text-lg tracking-tight group-hover:text-white transition-colors">
              ResearchPilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/" ? "text-white" : "text-text-secondary",
              )}
            >
              Home
            </Link>
            <Link
              href="/research"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/research" ? "text-white" : "text-text-secondary",
              )}
            >
              Research
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {!isResearch && (
              <Button
                variant={pathname === "/" ? "default" : "secondary"}
                size="sm"
                asChild
                className="rounded-full px-6"
              >
                <Link href="/research">Launch App</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
