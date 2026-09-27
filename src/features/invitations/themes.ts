import type { InvitationTemplateName } from "./content";

// The three templates share every section and differ in their first screen and in these styles.
export type InvitationTheme = {
  page: string;
  muted: string;
  accent: string;
  line: string;
  card: string;
  button: string;
  input: string;
  names: string;
  heading: string;
};

export const THEMES: Record<InvitationTemplateName, InvitationTheme> = {
  // Cream paper, serif headings, burgundy accents.
  classic: {
    page: "bg-[#faf6f0] text-[#2e2724]",
    muted: "text-[#2e2724]/60",
    accent: "text-[#8e3b55]",
    line: "border-[#2e2724]/12",
    card: "bg-white/70",
    button: "bg-[#8e3b55] text-white hover:bg-[#7a3249]",
    input: "border-[#2e2724]/15 bg-white focus-visible:border-[#8e3b55]",
    names: "font-serif",
    heading: "font-serif text-[1.618rem]",
  },
  // White, a lot of air, a large date, thin lines.
  minimal: {
    page: "bg-white text-neutral-900",
    muted: "text-neutral-500",
    accent: "text-neutral-900",
    line: "border-neutral-200",
    card: "bg-neutral-50",
    button: "bg-neutral-900 text-white hover:bg-neutral-700",
    input: "border-neutral-200 bg-white focus-visible:border-neutral-900",
    names: "font-sans font-light uppercase tracking-[0.18em]",
    heading: "font-sans text-[11px] font-medium uppercase tracking-[0.3em]",
  },
  // The couple's photo over the whole first screen, the details on warm paper below it.
  photo: {
    page: "bg-[#f6f2ed] text-[#221d1b]",
    muted: "text-[#221d1b]/60",
    accent: "text-[#6f4e37]",
    line: "border-[#221d1b]/12",
    card: "bg-white/80",
    button: "bg-[#221d1b] text-white hover:bg-[#3a322f]",
    input: "border-[#221d1b]/15 bg-white focus-visible:border-[#221d1b]",
    names: "font-serif",
    heading: "font-serif text-[1.618rem]",
  },
};
