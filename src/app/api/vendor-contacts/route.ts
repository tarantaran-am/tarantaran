import { createHash } from "node:crypto";
import { z } from "zod";
import { env } from "@/env";
import { routing } from "@/i18n/routing";
import { prisma } from "@/shared/lib/db";
import { CONTACT_EVENT_KINDS } from "@/shared/config/social";

const bodySchema = z.object({
  vendorId: z.uuid(),
  kind: z.enum(CONTACT_EVENT_KINDS),
  locale: z.enum(routing.locales),
});

const YEREVAN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" });

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;

export async function POST(request: Request) {
  // Browsers always send Origin on POST; reject other sites making their visitors report events for them.
  const origin = request.headers.get("origin");
  if (!origin || URL.parse(origin)?.host !== request.headers.get("host")) {
    return new Response(null, { status: 403 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_UA.test(userAgent)) return new Response(null, { status: 204 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const { vendorId, kind, locale } = parsed.data;

  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, isPublished: true },
    select: { id: true },
  });
  if (!vendor) return new Response(null, { status: 404 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
  const day = YEREVAN_DAY.format(new Date());
  const visitorHash = createHash("sha256").update(`${env.VISITOR_HASH_SALT}|${day}|${ip}|${userAgent}`).digest("hex");

  await prisma.contactEvent.createMany({
    data: [{ vendorId, kind, locale, day: new Date(day), visitorHash }],
    skipDuplicates: true,
  });

  return new Response(null, { status: 204 });
}
