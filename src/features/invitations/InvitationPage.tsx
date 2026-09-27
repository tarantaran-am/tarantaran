import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "cn";
import { Countdown } from "./Countdown";
import { THEMES, type InvitationTheme } from "./themes";
import { invitationTranslator, type InvitationMessages, type InvitationTranslator } from "./translator";
import { formatWeddingDate, type InvitationView } from "./view";

// One invitation page for all three templates: the public page renders it, and so does the builder's
// live preview. `rsvp` and `footer` are slots, because the public page answers for real and the
// preview only shows what guests will see. `screenHeight` is the height of one screen: the viewport
// on the public page, the phone frame in the builder.
export function InvitationPage({
  view,
  messages,
  isPast,
  rsvp,
  footer,
  screenHeight = "100svh",
}: {
  view: InvitationView;
  messages: InvitationMessages;
  isPast: boolean;
  rsvp: ReactNode;
  footer: ReactNode;
  screenHeight?: string;
}) {
  const theme = THEMES[view.template];
  const t = invitationTranslator(view.language, messages);
  const when = formatWeddingDate(view.startsAt, view.language);

  return (
    <article
      lang={view.language}
      className={cn("@container min-h-full", theme.page)}
      style={{ "--screen": screenHeight } as CSSProperties}
    >
      {view.template === "classic" && <ClassicHero view={view} theme={theme} t={t} date={when.date} />}
      {view.template === "minimal" && <MinimalHero view={view} theme={theme} t={t} />}
      {view.template === "photo" && <PhotoHero view={view} t={t} date={when.date} />}

      <div className="mx-auto flex max-w-md flex-col gap-16 px-6 py-16">
        {view.message && (
          <p className={cn("text-center font-serif text-[1.15rem] leading-relaxed whitespace-pre-line italic")}>
            {view.message}
          </p>
        )}

        <Section title={t("when")} theme={theme}>
          <div className={cn("rounded-3xl p-6 text-center", theme.card)}>
            <p className="font-serif text-[1.618rem] leading-tight">{when.date}</p>
            <p className={cn("mt-1 text-sm capitalize", theme.muted)}>
              {when.weekday}, {when.time}
            </p>
            <div className={cn("mx-auto my-5 w-12 border-t", theme.line)} />
            <p className="text-[15px] font-medium">{view.venueName}</p>
            {view.venueAddress && <p className={cn("mt-1 text-sm", theme.muted)}>{view.venueAddress}</p>}
            {view.mapUrl && (
              <a
                href={view.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors",
                  theme.button,
                )}
              >
                <MapPin className="size-4" />
                {t("directions")}
              </a>
            )}
          </div>
        </Section>

        {isPast ? (
          <p className="text-center font-serif text-[1.618rem] leading-snug">{t("past")}</p>
        ) : (
          <Countdown startsAt={view.startsAt} language={view.language} messages={messages} theme={theme} />
        )}

        {view.schedule.length > 0 && (
          <Section title={t("schedule")} theme={theme}>
            <ol className={cn("border-l", theme.line)}>
              {view.schedule.map((item, index) => (
                <li key={index} className="relative pb-6 pl-6 last:pb-0">
                  <span
                    className={cn("absolute top-1.5 -left-[5px] size-[9px] rounded-full bg-current", theme.accent)}
                  />
                  <p className={cn("text-sm tabular-nums", theme.muted)}>{item.time}</p>
                  <p className="mt-0.5 text-[15px]">{item.title}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {view.dressCode && (
          <Section title={t("dressCode")} theme={theme}>
            <p className="text-center text-[15px] leading-relaxed whitespace-pre-line">{view.dressCode}</p>
          </Section>
        )}

        {!isPast && rsvp}
      </div>

      <footer className={cn("border-t px-6 py-8 text-center text-xs", theme.line, theme.muted)}>{footer}</footer>
    </article>
  );
}

function Section({ title, theme, children }: { title: string; theme: InvitationTheme; children: ReactNode }) {
  return (
    <section>
      <h2 className={cn("mb-6 text-center", theme.heading)}>{title}</h2>
      {children}
    </section>
  );
}

function Names({ view, t, className }: { view: InvitationView; t: InvitationTranslator; className?: string }) {
  return (
    <h1 className={className}>
      <span className="block">{view.partnerOne}</span>
      <span className="my-1 block text-[0.45em] italic opacity-70">{t("and")}</span>
      <span className="block">{view.partnerTwo}</span>
    </h1>
  );
}

function Photo({ url, className, sizes }: { url: string; className: string; sizes: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={url} alt="" fill sizes={sizes} className="object-cover" loading="eager" fetchPriority="high" />
    </div>
  );
}

function ClassicHero({
  view,
  theme,
  t,
  date,
}: {
  view: InvitationView;
  theme: InvitationTheme;
  t: InvitationTranslator;
  date: string;
}) {
  return (
    <header className="flex min-h-[var(--screen)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className={cn("text-[11px] tracking-[0.3em] uppercase", theme.muted)}>{t("invite")}</p>
      {view.photoUrl && (
        <Photo url={view.photoUrl} sizes="280px" className="mt-10 aspect-[3/4] w-56 rounded-t-full shadow-sm" />
      )}
      <Names view={view} t={t} className="mt-10 font-serif text-[3rem] leading-[1.05]" />
      <p className={cn("mt-8 font-serif text-lg", theme.accent)}>{date}</p>
    </header>
  );
}

function MinimalHero({ view, theme, t }: { view: InvitationView; theme: InvitationTheme; t: InvitationTranslator }) {
  // The date as numbers is the centrepiece: 12 · 06 · 2027.
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" })
    .format(new Date(view.startsAt))
    .split("-");
  return (
    <header className="flex min-h-[var(--screen)] flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className={cn("text-[11px] tracking-[0.3em] uppercase", theme.muted)}>{t("invite")}</p>
        <p className="mt-10 font-sans text-[clamp(2.2rem,10.5cqw,3.4rem)] leading-none font-extralight whitespace-nowrap tabular-nums">
          {day}
          <span className={theme.muted}> · </span>
          {month}
          <span className={theme.muted}> · </span>
          {year}
        </p>
        <div className={cn("my-10 border-t", theme.line)} />
        <h1 className="font-sans text-[1.35rem] font-light tracking-[0.18em] uppercase">
          {view.partnerOne} <span className={theme.muted}>&amp;</span> {view.partnerTwo}
        </h1>
        {view.photoUrl && <Photo url={view.photoUrl} sizes="448px" className="mt-10 aspect-[4/5] w-full grayscale" />}
      </div>
    </header>
  );
}

function PhotoHero({ view, t, date }: { view: InvitationView; t: InvitationTranslator; date: string }) {
  return (
    <header className="relative flex min-h-[var(--screen)] flex-col justify-end overflow-hidden bg-[#2b2320] text-white">
      {view.photoUrl && (
        <Image
          src={view.photoUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          loading="eager"
          fetchPriority="high"
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      <div className="relative mx-auto w-full max-w-md px-6 pb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-80">{t("invite")}</p>
        <Names view={view} t={t} className="mt-6 font-serif text-[3.2rem] leading-[1.02]" />
        <p className="mt-6 font-serif text-lg opacity-90">{date}</p>
      </div>
    </header>
  );
}
