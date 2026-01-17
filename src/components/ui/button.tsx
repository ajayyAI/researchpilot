import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-ring",
  {
    variants: {
      variant: {
        dark: "gradient-dark-btn text-text-inverse rounded-full hover:scale-[1.02] active:scale-[0.98]",
        light:
          "gradient-light-btn text-text-primary rounded-full hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "bg-transparent hover:bg-heavy-metal/5 text-text-primary rounded-xl",
        link: "text-text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-12 px-6 text-sm",
        default: "h-14 px-8 text-sm",
        lg: "h-16 px-10 text-lg",
        icon: "h-14 w-14",
        "icon-sm": "h-12 w-12",
        "icon-lg": "h-16 w-16",
      },
    },
    defaultVariants: {
      variant: "dark",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "dark",
  size = "default",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
