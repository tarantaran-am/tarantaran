import type { ReactNode } from "react";

export function SectionHeading({
  breadcrumbs,
  title,
  description,
}: {
  breadcrumbs: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {breadcrumbs}
      <h1 className="mt-4 font-serif text-[length:var(--text-page)] leading-[1.1] text-foreground">{title}</h1>
      {description && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
