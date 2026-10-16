// The address of a published invitation, /i/ani-aram: the two names in Latin letters.

import { latin } from "@/shared/lib/latin";

// The addresses to try, best first: the names in either order, then with "and", then the same with
// underscores. Eight ways for two couples with the same names to both get a clean address.
export function slugCandidates(partnerOne: string, partnerTwo: string): string[] {
  const one = latin(partnerOne) || "wedding";
  const two = latin(partnerTwo) || "wedding";
  const orders = [
    [one, two],
    [two, one],
    [one, "and", two],
    [two, "and", one],
  ];
  const candidates = ["-", "_"].flatMap((separator) => orders.map((parts) => parts.join(separator)));
  return [...new Set(candidates)];
}

// The address the builder shows before publishing: the first candidate.
export function slugFromNames(partnerOne: string, partnerTwo: string): string {
  return slugCandidates(partnerOne, partnerTwo)[0]!;
}
