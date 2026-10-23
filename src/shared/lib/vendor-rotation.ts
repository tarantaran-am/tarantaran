// Until there is paid promotion, listings rotate daily so every vendor gets its turn at the top.
// The order is a hash of the vendor id and the day: stable within the day, so pagination neither
// repeats nor skips anyone, and the same for every visitor, so pages stay cacheable.

const TIME_ZONE = "Asia/Yerevan";
// The day turns over at 05:00 Yerevan time, when almost nobody is paging through the catalog.
const ROTATION_HOUR = 5;

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function rotationSeed(now: Date): string {
  return dayFormat.format(new Date(now.getTime() - ROTATION_HOUR * 60 * 60 * 1000));
}

// FNV-1a: fast, and spreads similar ids (same seed, ids differing by a character) well enough.
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

type Rotatable = { id: string; isVerified: boolean };

// Verified vendors first, then the day's shuffle; the id breaks hash ties so the order is total.
export function rotationOrder(vendors: Rotatable[], seed: string): string[] {
  return vendors
    .map((v) => ({ id: v.id, verified: v.isVerified, rank: hash(`${seed}|${v.id}`) }))
    .sort((a, b) => Number(b.verified) - Number(a.verified) || a.rank - b.rank || (a.id < b.id ? -1 : 1))
    .map((v) => v.id);
}
