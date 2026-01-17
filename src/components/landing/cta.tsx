"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-electric-blue/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-bg-primary)_0%,transparent_100%)] opacity-80" />

      <div className="container-width relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-h1 text-white mb-8"
        >
          Ready to dive <span className="text-electric-blue">deeper?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-text-secondary max-w-xl mx-auto mb-12"
        >
          Join thousands of researchers uncovering the truth with ResearchPilot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            className="h-14 px-8 rounded-full bg-white text-deep-void text-lg font-medium hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/research">
              Start Researching Now <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
