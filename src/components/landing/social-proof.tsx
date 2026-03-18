"use client";

import { motion } from "framer-motion";

const companies = [
  "Acme Corp",
  "Quantum Systems",
  "Nebula AI",
  "Starlight Ventures",
  "Void Tech",
];

export function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-white/2">
      <div className="container-width">
        <p className="text-center text-sm text-white/40 mb-8 font-medium uppercase tracking-wider">
          Trusted by forward-thinking teams
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {companies.map((company, i) => (
            <motion.div
              key={company}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-bold text-white/80"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
