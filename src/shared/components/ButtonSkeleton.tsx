import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "cn";

// A button-shaped placeholder with a darker band sweeping across it, for a button whose label is not
// known yet. The children are the label it will most likely get: hidden, they give it the button's
// exact size, so nothing shifts once the real button replaces it. Built on the ghost variant, which
// has no fill of its own, so bg-muted is the only background.
export function ButtonSkeleton({
  size,
  className,
  children,
}: {
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant: "ghost", size }),
        "pointer-events-none relative overflow-hidden bg-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent motion-safe:after:animate-shimmer",
        className,
      )}
    >
      <span className="invisible">{children}</span>
    </span>
  );
}
