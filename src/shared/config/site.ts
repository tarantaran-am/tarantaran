export const BRAND = "Taran Taran";

export const CONTACT_EMAIL = "tarantaran.am@gmail.com";

export const CONTACT_PHONE = "+374 43 467 302";

export const WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}`;

export const SOCIAL_LINKS = [
  {
    key: "instagram",
    label: "Instagram",
    handle: "@tarantaran.am",
    href: "https://www.instagram.com/tarantaran.am/",
  },
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@tarantaran.am",
    href: "https://www.tiktok.com/@tarantaran.am",
  },
  {
    key: "telegram",
    label: "Telegram",
    handle: "@tarantaranam",
    href: "https://t.me/tarantaranam",
  },
] as const;
