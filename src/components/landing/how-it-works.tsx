const steps = [
  {
    number: "01",
    title: "Enter your topic",
    description:
      "Describe what you want to research. Be specific for better, more targeted results.",
  },
  {
    number: "02",
    title: "Configure depth & breadth",
    description:
      "Set how many parallel queries and recursive levels to explore your topic.",
  },
  {
    number: "03",
    title: "AI does the research",
    description:
      "Watch as the AI recursively searches, learns, and follows promising leads.",
  },
  {
    number: "04",
    title: "Get your report",
    description:
      "Receive a comprehensive report synthesizing all findings with sources cited.",
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-bg-inverse" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16 md:mb-20">
          <h2 className="text-h2 font-semibold leading-[1.05] tracking-[-0.02em] text-text-inverse mb-4">
            How it works
          </h2>
          <p className="text-body-lg text-text-inverse/70 leading-relaxed">
            Four simple steps to comprehensive research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-text-inverse/10" />
              )}

              <div className="space-y-4">
                <span className="text-overline text-text-inverse/40">
                  {step.number}
                </span>
                <h3 className="text-h5 font-semibold text-text-inverse">
                  {step.title}
                </h3>
                <p className="text-body-sm text-text-inverse/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
