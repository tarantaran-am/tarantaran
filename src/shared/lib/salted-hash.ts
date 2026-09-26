import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/env";

// sha256(salt | part | part…): lets us count or deduplicate visitors and addresses without storing them.
export function saltedHash(...parts: string[]): string {
  return createHash("sha256")
    .update([env.VISITOR_HASH_SALT, ...parts].join("|"))
    .digest("hex");
}
