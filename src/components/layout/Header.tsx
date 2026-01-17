"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const isResearch = pathname === "/research";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-4" : "py-6",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div
          className={cn(
            "rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300",
            scrolled
              ? "bg-deep-void/80 backdrop-blur-xl border border-white/10 shadow-lg"
              : "bg-transparent border border-transparent",
          )}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-full bg-electric-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <div className="size-2.5 rounded-full bg-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white">
              ResearchPilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/" ? "text-white" : "text-white/60",
              )}
            >
              Home
            </Link>
            <Link
              href="/research"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/research" ? "text-white" : "text-white/60",
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
                className="rounded-full px-6 bg-white text-deep-void hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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
