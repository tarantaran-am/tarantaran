import type { ReactNode } from "react";
import { Eyebrow } from "@/shared/components/eyebrow";

export function SectionTitle({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
      <h2 className="font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">{title}</h2>
      {description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
