"use client";

import { motion } from "framer-motion";
import { Layers, Search, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Recursive Exploration",
    description:
      "The AI generates intelligent follow-up queries, digging deeper than surface-level results to find the hidden gems.",
    icon: Search,
    className: "md:col-span-2",
  },
  {
    title: "Multi-Level Depth",
    description:
      "Control the depth of research from quick summaries to deep dive reports.",
    icon: Layers,
    className: "md:col-span-1",
  },
  {
    title: "Citations & Sources",
    description:
      "Every claim is backed by verified links. No hallucinations, just facts.",
    icon: Globe,
    className: "md:col-span-1",
  },
  {
    title: "Synthesized Reports",
    description:
      "Get a comprehensive standard report that reads like it was written by a human analyst.",
    icon: FileText,
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section className="section relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/5 rounded-full blur-[100px] opacity-20" />

      <div className="container-width relative z-10">
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h2 mb-6"
          >
            Research capabilities <br />
            <span className="text-text-secondary">reimagined</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-body-lg text-text-secondary"
          >
            Beyond simple search. A complete research engine that thinks,
            verifies, and synthesizes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group relative p-6 sm:p-8 rounded-3xl bg-white/3 border border-white/10 hover:bg-white/5 transition-colors overflow-hidden",
                feature.className,
              )}
            >
              <div className="absolute inset-0 bg-linear-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 h-full flex flex-col">
                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-electric-blue/20 group-hover:border-electric-blue/30">
                  <feature.icon className="size-6 text-white group-hover:text-electric-blue transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed grow">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
