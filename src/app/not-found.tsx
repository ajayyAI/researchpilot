import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex-1 flex items-center justify-center py-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-text-secondary max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button variant="outline" asChild className="rounded-full px-6">
          <Link href="/">
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </section>
  );
}
