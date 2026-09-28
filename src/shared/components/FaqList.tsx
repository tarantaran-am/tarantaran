import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export type FaqEntry = { id: string; question: ReactNode; answer: ReactNode };

export function FaqList({ items }: { items: FaqEntry[] }) {
  return (
    <div className="border-b border-border">
      {items.map((item) => (
        <details key={item.id} className="group border-t border-border">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[15px] font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <Plus
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="max-w-2xl pr-10 pb-6 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
