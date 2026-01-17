import { Layers, Search, FileText } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Recursive Search",
    description:
      "Automatically generates follow-up queries based on initial findings, exploring topics deeper than a single search ever could.",
  },
  {
    icon: Layers,
    title: "Multi-Level Depth",
    description:
      "Configure how deep the research goes. Each level builds on previous learnings to uncover nuanced insights.",
  },
  {
    icon: FileText,
    title: "Synthesized Reports",
    description:
      "All findings are compiled into a comprehensive, well-structured report with citations and key learnings.",
  },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <h2 className="text-h2 font-semibold leading-[1.05] tracking-[-0.02em] mb-4">
            <span className="text-gradient-primary">Research smarter,</span>{" "}
            <span className="text-gradient-muted">not harder</span>
          </h2>
          <p className="text-body-lg text-text-secondary leading-relaxed">
            Built on the latest AI research techniques to deliver insights that
            would take hours to compile manually.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card group hover:bg-bg-tertiary transition-colors duration-300"
            >
              <div className="p-3 rounded-xl bg-bg-primary w-fit mb-6 group-hover:bg-bg-secondary transition-colors duration-300">
                <feature.icon className="size-6 text-text-muted" />
              </div>
              <h3 className="text-h4 font-semibold text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
