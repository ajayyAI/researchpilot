import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <section className="flex-1 flex items-center justify-center py-24">
      <div className="text-center space-y-4">
        <Loader2 className="size-8 text-electric-blue animate-spin mx-auto" />
        <p className="text-text-secondary">Loading research interface...</p>
      </div>
    </section>
  );
}
