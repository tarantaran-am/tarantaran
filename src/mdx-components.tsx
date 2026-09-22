import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: ({ children }) => (
    <h2
      className="mt-8 mb-4 font-serif leading-[1.2] text-foreground"
      style={{ fontSize: "clamp(1.4rem, 1.8vw, 1.9rem)" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-10 mb-3 font-sans text-base font-medium text-foreground">{children}</h3>,
  p: ({ children }) => <p className="mb-5 text-[15px] leading-[1.75] text-muted-foreground">{children}</p>,
  ul: ({ children }) => <ul className="mb-6 flex list-none flex-col gap-2.5 pl-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-6 flex list-decimal flex-col gap-2.5 pl-5">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-5 text-[15px] leading-[1.7] text-muted-foreground before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-1.5 before:bg-foreground/35">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-2 border-foreground/25 pl-5 text-[15px] leading-[1.7] text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-foreground underline underline-offset-4 hover:opacity-70">
      {children}
    </a>
  ),
  hr: () => <hr className="my-12 border-border" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
