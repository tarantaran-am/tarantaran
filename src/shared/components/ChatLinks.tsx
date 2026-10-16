import { cn } from "cn";
import { SocialIcon } from "@/shared/components/SocialIcon";
import { buttonVariants } from "@/shared/components/ui/button";
import { SOCIAL_LINKS, WHATSAPP_URL } from "@/shared/config/site";

// The chats a vendor can reach us in, e.g. to have their card made for them instead of filling in the form.
const CHATS = [
  { network: "whatsapp", label: "WhatsApp", href: WHATSAPP_URL },
  ...SOCIAL_LINKS.filter((link) => link.key === "telegram" || link.key === "instagram").map((link) => ({
    network: link.key,
    label: link.label,
    href: link.href,
  })),
] as const;

export function ChatLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CHATS.map(({ network, label, href }) => (
        <a
          key={network}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <SocialIcon network={network} className="size-4" />
          {label}
        </a>
      ))}
    </div>
  );
}
