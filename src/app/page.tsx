import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { SocialProof } from "@/components/landing/social-proof";

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
