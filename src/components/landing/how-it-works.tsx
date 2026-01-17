const steps = [
  {
    number: "01",
    title: "Enter your topic",
    description:
      "Describe what you want to research. Be specific for better, more targeted results.",
  },
  {
    number: "02",
    title: "Configure settings",
    description:
      "Set how many parallel queries and recursive levels to explore your topic.",
  },
  {
    number: "03",
    title: "AI Researcher",
    description:
      "Watch as the AI recursively searches, learns, and follows promising leads in real-time.",
  },
  {
    number: "04",
    title: "Final Report",
    description:
      "Receive a comprehensive report synthesizing all findings with citations and key takeaways.",
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-charcoal/50" id="how-it-works">
      <div className="container-width">
        <div className="max-w-3xl mb-16 md:mb-20">
          <h2 className="text-h2 font-medium leading-[1.1] tracking-tight text-white mb-6">
            How it works
          </h2>
          <p className="text-body-lg text-text-secondary leading-relaxed font-light">
            Four simple steps to comprehensive, production-grade research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[60%] w-[120%] h-px bg-white/10" />
              )}

              <div className="space-y-6 relative z-10">
                <span className="inline-block text-4xl font-mono font-bold text-white/5 group-hover:text-electric-blue/20 transition-colors duration-300">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
