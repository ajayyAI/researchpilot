import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white shadow-sm placeholder:text-text-secondary focus-visible:border-electric-blue/50 focus-visible:ring-1 focus-visible:ring-electric-blue/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none transition-all duration-300 hover:bg-white/[0.07]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
