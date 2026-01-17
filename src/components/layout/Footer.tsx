import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-bg-secondary mt-auto">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30">
                <div className="size-2 rounded-full bg-electric-blue" />
              </div>
              <span className="font-semibold text-white tracking-tight">
                ResearchPilot
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
              Advanced AI-powered recursive research assistant for deep dives
              into any topic.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <Link
                  href="/research"
                  className="hover:text-electric-blue transition-colors"
                >
                  Start Research
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-electric-blue transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ResearchPilot. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
