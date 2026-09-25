// Reporting periods shared by the admin's lead list and statistics.

export const PERIODS = [
  { value: "7", label: "7 дней", days: 7 },
  { value: "30", label: "30 дней", days: 30 },
  { value: "90", label: "90 дней", days: 90 },
  { value: "all", label: "Всё время", days: null },
] as const;

export type Period = (typeof PERIODS)[number]["value"];

export const DEFAULT_PERIOD: Period = "30";

export function parsePeriod(value: unknown): Period {
  return PERIODS.find((period) => period.value === value)?.value ?? DEFAULT_PERIOD;
}

// The start of the period, or null for all time.
export function periodStart(period: Period, now = new Date()): Date | null {
  const days = PERIODS.find((option) => option.value === period)?.days ?? null;
  return days === null ? null : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// "за 30 дней (26 августа — 25 сентября 2026)" or "за всё время", for reports sent to vendors.
export function describePeriod(period: Period, now = new Date()): string {
  const start = periodStart(period, now);
  if (!start) return "за всё время";
  const day = (date: Date, withYear: boolean) =>
    date.toLocaleDateString("ru-RU", {
      timeZone: "Asia/Yerevan",
      day: "numeric",
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
    });
  const label = PERIODS.find((option) => option.value === period)!.label;
  return `за ${label} (${day(start, false)} — ${day(now, true)})`;
}
