// Limits shared by the lead form and its server action, so both check the same thing.

export const MESSAGE_MAX_LENGTH = 1000;

const EVENT_YEARS_AHEAD = 3;

// A date as YYYY-MM-DD, the format <input type="date"> uses, in the given time zone (local by default).
function isoDate(date: Date, timeZone?: string): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

// Events can be booked from today up to a few years ahead.
export function eventDateBounds(now = new Date(), timeZone?: string): { min: string; max: string } {
  const latest = new Date(now);
  latest.setFullYear(latest.getFullYear() + EVENT_YEARS_AHEAD);
  return { min: isoDate(now, timeZone), max: isoDate(latest, timeZone) };
}

// The server allows a day either side, since the visitor's "today" may differ from Yerevan's.
export function isEventDateInRange(date: string, now = new Date()): boolean {
  const day = 24 * 60 * 60 * 1000;
  const { min } = eventDateBounds(new Date(now.getTime() - day), "Asia/Yerevan");
  const { max } = eventDateBounds(new Date(now.getTime() + day), "Asia/Yerevan");
  return date >= min && date <= max;
}
