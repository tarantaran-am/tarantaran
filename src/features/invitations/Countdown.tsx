"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";
import type { InvitationTheme } from "./themes";
import { invitationTranslator, type InvitationMessages } from "./translator";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function split(ms: number) {
  return [
    { unit: "days", count: Math.floor(ms / DAY) },
    { unit: "hours", count: Math.floor((ms % DAY) / HOUR) },
    { unit: "minutes", count: Math.floor((ms % HOUR) / MINUTE) },
    { unit: "seconds", count: Math.floor((ms % MINUTE) / SECOND) },
  ];
}

// Days, hours, minutes and seconds until the ceremony, ticking every second. Rendered empty on the
// server and during hydration, since the server's clock would disagree with the guest's.
export function Countdown({
  startsAt,
  language,
  messages,
  theme,
}: {
  startsAt: string;
  language: string;
  messages: InvitationMessages;
  theme: InvitationTheme;
}) {
  const t = invitationTranslator(language, messages);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, []);

  const parts = split(now === null ? 0 : Math.max(0, Date.parse(startsAt) - now));

  return (
    <section aria-label={t("countdown.title")} className="text-center">
      <p className={cn("mb-5 text-[11px] tracking-[0.3em] uppercase", theme.muted)}>{t("countdown.title")}</p>
      <div className="grid grid-cols-4 gap-2">
        {parts.map(({ unit, count }) => (
          <div key={unit} className={cn("rounded-2xl py-4", theme.card)}>
            <div className="font-serif text-[2rem] leading-none tabular-nums" suppressHydrationWarning>
              {now === null ? "–" : count}
            </div>
            <div className={cn("mt-2 text-[11px]", theme.muted)}>{t(`countdown.${unit}`, { count })}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
