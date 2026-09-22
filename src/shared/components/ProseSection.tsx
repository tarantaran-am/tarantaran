import type { ReactNode } from "react";

export function ProseSection({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[820px] px-6 pb-24 md:px-10 md:pb-32 lg:px-16 xl:px-20">
      <div className="flex flex-col gap-5 text-[15px] leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}
