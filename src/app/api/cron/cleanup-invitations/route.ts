import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/shared/lib/db";
import { bucketStorage } from "@/shared/lib/storage";

// Run daily by Vercel Cron (vercel.json). Guests' names are personal data, and the privacy policy promises
// to keep invitations and replies for six months after the wedding. No secret: all a call can do is
// remove what is already due, so anyone triggering it early changes nothing.
const KEEP_MONTHS = 6;

export async function GET() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - KEEP_MONTHS);

  const expired = await prisma.invitation.findMany({
    where: { startsAt: { lt: cutoff } },
    select: { id: true, photoUrl: true },
  });
  if (expired.length === 0) return Response.json({ deleted: 0 });

  // Rows first: replies go with them by cascade. A photo left behind by a failed Storage call is harmless.
  await prisma.invitation.deleteMany({ where: { id: { in: expired.map(({ id }) => id) } } });

  const storage = bucketStorage("invitations");
  const photos = expired.flatMap(({ photoUrl }) => (photoUrl ? [storage.pathFromPublicUrl(photoUrl)] : []));
  await storage.removeObjects(photos.filter((path): path is string => path !== null)).catch(Sentry.captureException);

  return Response.json({ deleted: expired.length });
}
