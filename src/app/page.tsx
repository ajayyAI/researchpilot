"use client";

import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />

      <section className="section py-24 md:py-32">
        <div className="container-width">
          <div className="glass-card max-w-5xl mx-auto text-center px-6 py-16 md:py-24 rounded-[3rem] border border-white/5 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-blue/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-h2 font-medium text-white mb-6">
                Ready to dive deep?
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                Start your first AI-powered research session today. No credit
                card required.
              </p>
              <Button
                size="lg"
                className="rounded-full h-14 px-8 text-lg"
                asChild
              >
                <Link href="/research">
                  <span>Start Researching</span>
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
