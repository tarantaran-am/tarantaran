import type { ReactNode } from "react";
import Image from "next/image";
import { Eyebrow } from "@/shared/components/eyebrow";

// Sign-in and sign-up: a full-bleed photo with the form card on top. The card sits in the wider
// golden-ratio column on the sky; the caption sits in the narrow one, low on the dark hills.
export function AuthShell({
  eyebrow,
  title,
  description,
  imageAlt,
  caption,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageAlt: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-svh overflow-hidden bg-tone-sand">
      <Image
        src="/backgrounds/bg-auth.jpg"
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-10 scale-[1.02] object-cover object-bottom blur-[2px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 px-6 pt-28 pb-16 md:px-10 md:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-16 lg:px-16 lg:pt-36 lg:pb-20 xl:px-20">
        <p className="hidden max-w-xs self-end font-serif text-[1.618rem] leading-snug text-white italic drop-shadow-sm lg:block">
          {caption}
        </p>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[520px] rounded-[20px] border border-border bg-background p-6 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] sm:p-8 md:p-10">
            <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
            <h1 className="font-serif text-[length:var(--text-page)] leading-[1.1] text-foreground">{title}</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
