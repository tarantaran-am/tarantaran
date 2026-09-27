import { z } from "zod";
import { isEventDateInRange } from "@/features/vendor/lead-limits";

// What a couple fills in, shared by the builder in the browser and the actions that save it.

export const INVITATION_TEMPLATES = ["classic", "minimal", "photo"] as const;
export const INVITATION_LANGUAGES = ["hy", "ru", "en"] as const;
export type InvitationTemplateName = (typeof INVITATION_TEMPLATES)[number];
export type InvitationLanguage = (typeof INVITATION_LANGUAGES)[number];

export const MAX_DRAFTS = 5;
export const MAX_SCHEDULE_ITEMS = 8;
// Answering for a family, the most one guest can bring, themselves included.
export const MAX_GUESTS = 10;

// Weddings are in Armenia, which has no daylight saving time: every time is entered and shown at +04:00.
export const WEDDING_TIME_ZONE = "Asia/Yerevan";
const WEDDING_UTC_OFFSET = "+04:00";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
// Letters of any script, spaces, hyphens and apostrophes: names, not links or phone numbers.
const NAME = /^[\p{L}][\p{L}\s'’-]*$/u;

// Google and Yandex Maps only, including their short share links: the button opens the maps app,
// so an arbitrary link there could send guests anywhere.
export function isMapUrl(value: string): boolean {
  const url = URL.parse(value);
  if (!url || url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^www\./, "");
  if (host === "maps.app.goo.gl" || host === "maps.google.com") return true;
  if (host === "goo.gl") return url.pathname.startsWith("/maps");
  if (/^google\.[a-z.]+$/.test(host)) return url.pathname.startsWith("/maps");
  if (/^yandex\.(ru|com|am|by|kz|com\.tr)$/.test(host)) return /^\/(maps|navi)(\/|$)/.test(url.pathname);
  return false;
}

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((value) => value || undefined);

export const invitationContentSchema = z
  .object({
    template: z.enum(INVITATION_TEMPLATES),
    language: z.enum(INVITATION_LANGUAGES),
    partnerOne: text(40).min(1).regex(NAME),
    partnerTwo: text(40).min(1).regex(NAME),
    date: z.iso.date().refine((date) => isEventDateInRange(date)),
    time: z.string().regex(TIME),
    venueName: text(80).min(1),
    venueAddress: optionalText(160),
    mapUrl: optionalText(500).refine((url) => url === undefined || isMapUrl(url)),
    schedule: z.array(z.object({ time: z.string().regex(TIME), title: text(80).min(1) })).max(MAX_SCHEDULE_ITEMS),
    dressCode: optionalText(200),
    message: optionalText(600),
    rsvpDeadline: z.iso
      .date()
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine((content) => !content.rsvpDeadline || content.rsvpDeadline <= content.date, { path: ["rsvpDeadline"] });

export type InvitationContent = z.infer<typeof invitationContentSchema>;
export type InvitationField = keyof InvitationContent;

// What the builder starts from and keeps in the browser: every field as the form holds it.
export type InvitationDraft = z.input<typeof invitationContentSchema>;

export const EMPTY_DRAFT: InvitationDraft = {
  template: "classic",
  language: "hy",
  partnerOne: "",
  partnerTwo: "",
  date: "",
  time: "16:00",
  venueName: "",
  venueAddress: "",
  mapUrl: "",
  schedule: [],
  dressCode: "",
  message: "",
  rsvpDeadline: "",
};

// The fields that failed, so the builder can mark them.
export function invalidFields(draft: InvitationDraft): InvitationField[] {
  const parsed = invitationContentSchema.safeParse(draft);
  return parsed.success ? [] : [...new Set(parsed.error.issues.map((issue) => issue.path[0] as InvitationField))];
}

export function startsAt({ date, time }: Pick<InvitationContent, "date" | "time">): Date {
  return new Date(`${date}T${time}:00${WEDDING_UTC_OFFSET}`);
}

// The date and time back as the form holds them, in Yerevan time.
export function splitStartsAt(value: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WEDDING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}
