import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-electric-blue rounded-full blur-[128px]" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-neon-purple rounded-full blur-[128px]" />
      </div>

      <div className="container-width relative z-10">
        <div className="max-w-4xl mx-auto text-center hero-stagger">
          <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="size-3.5 text-electric-blue" />
            <span className="text-xs sm:text-sm font-medium text-white/90">
              AI-Powered Research Agent
            </span>
          </div>

          <h1 className="hero-fade-in text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.1] tracking-tight mb-8">
            <span className="text-white">Deep research</span>{" "}
            <span className="text-white/40">at the speed of thought</span>
          </h1>

          <p className="hero-fade-in text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Recursive AI-powered research that explores topics in depth,
            synthesizes findings from multiple sources, and generates
            comprehensive reports in minutes.
          </p>

          <div className="hero-fade-in flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full text-base shadow-electric-blue/20"
              asChild
            >
              <Link href="/research">
                <span>Start Researching</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 rounded-full text-base border-white/10 hover:bg-white/5"
              asChild
            >
              <a href="#how-it-works">
                <span>See How It Works</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
