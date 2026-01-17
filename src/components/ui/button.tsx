import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-ring",
  {
    variants: {
      variant: {
        default:
          "bg-electric-blue text-white shadow-lg shadow-electric-blue/25 hover:bg-electric-blue/90 hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        outline:
          "border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-text-secondary",
        secondary: "bg-white text-black hover:bg-white/90 shadow-sm",
        ghost: "hover:bg-white/5 hover:text-white text-text-secondary",
        link: "text-electric-blue underline-offset-4 hover:underline",
        // Legacy support (optional, can be removed if refactored everywhere)
        dark: "bg-charcoal text-white border border-white/10 hover:bg-white/5",
        light: "bg-white text-black hover:bg-white/90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
