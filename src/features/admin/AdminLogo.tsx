import { RingsMark } from "@/shared/components/RingsMark";

// The site logo reads its wordmark from translations, which the admin doesn't load.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-serif text-[15px] tracking-[0.18em] text-foreground">
      TARAN
      <RingsMark className="h-[1.9em] w-auto shrink-0 text-primary" />
      TARAN
    </span>
  );
}
