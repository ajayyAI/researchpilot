"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for quick fact-checking and simple queries.",
    features: [
      "5 searches per day",
      "Basic query depth",
      "Standard sources",
      "Web interface access",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Deep research capabilities for professionals.",
    popular: true,
    features: [
      "Unlimited searches",
      "Maximum recursive depth",
      "Export to PDF & Markdown",
      "Priority processing",
      "Academic sources mode",
    ],
  },
  {
    name: "Team",
    price: "Custom",
    description: "Collaborative research for organizations.",
    features: [
      "Shared workspaces",
      "API access",
      "Custom integration",
      "SSO & Security",
      "Dedicated support",
    ],
  },
];

export function Pricing() {
  return (
    <section className="section relative">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-4">Simple, transparent pricing</h2>
          <p className="text-text-secondary text-lg">
            Choose the power you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative p-6 sm:p-8 rounded-3xl border flex flex-col transition-all duration-300",
                plan.popular
                  ? "bg-white/5 border-electric-blue/50 shadow-[0_0_50px_rgba(59,130,246,0.1)] md:scale-105 z-10"
                  : "bg-white/2 border-white/5 hover:border-white/10",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-electric-blue text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-text-secondary text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  {plan.description}
                </p>
              </div>

              <div className="grow space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="size-4 text-electric-blue shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className={cn(
                  "w-full rounded-full h-12",
                  plan.popular
                    ? "bg-electric-blue hover:bg-electric-blue/90"
                    : "border-white/10 hover:bg-white/5 text-white",
                )}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
