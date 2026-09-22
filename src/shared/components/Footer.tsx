import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/shared/lib/categories";
import { Container } from "@/shared/components/container";
import { Logo } from "@/shared/components/Logo";
import { SOCIAL_LINKS } from "@/shared/config/site";

export async function Footer() {
  const [t, categories] = await Promise.all([getTranslations("Footer"), getCategories()]);

  const links: Record<string, { label: string; href: string }[]> = {
    [t("sections.catalog")]: categories.map((c) => ({ label: c.namePlural, href: `/catalog/${c.slug}` })),
    [t("sections.company")]: [
      { label: t("links.about"), href: "/about" },
      { label: t("links.blog"), href: "/blog" },
    ],
    [t("sections.vendors")]: [{ label: t("links.listProfile"), href: "/for-vendors" }],
    [t("sections.help")]: [
      { label: t("links.contacts"), href: "/contacts" },
      { label: t("links.privacy"), href: "/privacy" },
      { label: t("links.terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border bg-background py-16 md:py-20">
      <Container>
        <div className="mb-14 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              <Logo className="text-base" />
            </Link>
            <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">{t("tagline")}</p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="mb-5 text-[10px] font-medium tracking-[0.15em] text-foreground uppercase">{section}</div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
