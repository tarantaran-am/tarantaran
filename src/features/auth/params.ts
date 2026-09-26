import type { AccountRole } from "@/generated/prisma/enums";

// The role comes from the signup form, so anything unknown is dropped rather than trusted.
export function parseRole(value: string | null | undefined): AccountRole | null {
  return value === "couple" || value === "vendor" ? value : null;
}
