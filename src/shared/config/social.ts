export const SOCIAL_NETWORKS = ["instagram", "facebook", "tiktok", "telegram", "whatsapp", "website"] as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  website: "Website",
};

export function socialUrl(network: SocialNetwork, value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  switch (network) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "telegram":
      return `https://t.me/${handle}`;
    case "whatsapp":
      return `https://wa.me/${handle.replace(/[^\d]/g, "")}`;
    case "website":
      return `https://${handle}`;
  }
}

export const CONTACT_EVENT_KINDS = ["reveal", ...SOCIAL_NETWORKS] as const;

export type ContactEventKind = (typeof CONTACT_EVENT_KINDS)[number];
