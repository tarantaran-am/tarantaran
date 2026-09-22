import type { ReactNode } from "react";

import { cn } from "cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 xl:px-20", className)}>{children}</div>;
}
