import type { VendorApplicationStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<VendorApplicationStatus, string> = {
  pending: "На проверке",
  approved: "Одобрена",
  rejected: "На доработке",
};

export const STATUS_CLASSES: Record<VendorApplicationStatus, string> = {
  pending: "bg-primary text-primary-foreground",
  approved: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};
