import type { ReactNode } from "react";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="pt-16 md:pt-[68px]">
      <Container className="py-16 md:py-20">
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h1 className="max-w-2xl font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
          {title}
        </h1>
        {description && <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </Container>
    </div>
  );
}
