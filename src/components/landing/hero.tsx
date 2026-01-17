import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg-secondary py-24 md:py-32">
      <div className="absolute inset-0 bg-linear-to-b from-silver/30 via-bg-secondary to-bg-primary" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center hero-stagger">
          {/* Badge */}
          <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-bg-primary border border-border-default">
            <Sparkles className="size-4 text-text-muted" />
            <span className="text-caption font-medium text-text-muted">
              AI-Powered Research
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-fade-in text-display font-semibold leading-[1.05] tracking-[-0.02em] mb-6">
            <span className="text-gradient-primary">Deep research</span>{" "}
            <span className="text-gradient-muted">at the speed of thought</span>
          </h1>

          {/* Subheadline */}
          <p className="hero-fade-in text-body-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Recursive AI-powered research that explores topics in depth,
            synthesizes findings from multiple sources, and generates
            comprehensive reports.
          </p>

          {/* CTAs */}
          <div className="hero-fade-in flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="dark" size="lg" asChild>
              <Link href="/research">
                <span>Start Researching</span>
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button variant="light" size="lg" asChild>
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
