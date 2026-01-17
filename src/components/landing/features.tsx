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
    <section className="section relative" id="features">
      <div className="container-width">
        <div className="max-w-3xl mb-16 md:mb-20">
          <h2 className="text-h2 font-medium leading-[1.1] tracking-tight mb-6">
            <span className="text-white">Research smarter,</span>{" "}
            <span className="text-white/40">not harder</span>
          </h2>
          <p className="text-body-lg text-text-secondary leading-relaxed max-w-2xl font-light">
            Built on the latest AI research techniques to deliver insights that
            would take hours to compile manually.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="size-6 text-electric-blue" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
