"use client";

// Landing sections
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Landing Sections */}
      <Hero />
      <Features />
      <HowItWorks />

      {/* CTA Section */}
      <section className="section">
        <div className="container mx-auto px-6">
          <div className="card-dark max-w-4xl mx-auto text-center py-16 md:py-20">
            <h2 className="text-h2 font-semibold text-white mb-6">
              Ready to dive deep?
            </h2>
            <p className="text-body-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Start your first AI-powered research session today. No credit card
              required.
            </p>
            <Button variant="light" size="lg" asChild>
              <Link href="/research">
                <span>Start Researching</span>
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-compact border-t border-border-default">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-text-muted">
              Deep Research — AI-powered recursive research
            </p>
            <p className="text-body-sm text-text-muted">
              Built with AI SDK v6 & Firecrawl
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
