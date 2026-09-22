import type { ReactNode } from "react";

import { cn } from "cn";

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("text-[10px] tracking-[0.22em] text-muted-foreground uppercase", className)}>{children}</p>;
}
