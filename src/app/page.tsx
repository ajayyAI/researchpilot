import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SocialProof } from "@/components/landing/social-proof";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <SocialProof />
      <Features />
      <Pricing />
      <CTA />
    </div>
  );
}
