"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#030305]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/10 rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-purple/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Grid Pattern - CSS-based */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(180deg, white, transparent)",
        }}
      />

      <div className="container-width relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="size-4 text-electric-blue" />
          <span className="text-sm font-medium text-white/80">
            Research at the speed of thought
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-display text-white mb-8 max-w-5xl mx-auto"
        >
          Deep Research <br />
          <span className="text-gradient">Without the Noise</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed"
        >
          Stop wading through SEO slop. Get precise, synthesized answers to
          complex questions, backed by verified sources.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            size="lg"
            className="rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
            asChild
          >
            <Link href="/research">
              Start Researching <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-white/10 text-white hover:bg-white/5 h-12 px-8 text-base backdrop-blur-sm"
          >
            How it works
          </Button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#030305] to-transparent pointer-events-none" />
    </section>
  );
}
