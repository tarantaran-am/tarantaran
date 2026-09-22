import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/PageHeader";
import { ProseSection } from "@/shared/components/ProseSection";
import { SOCIAL_LINKS } from "@/shared/config/site";

export async function ContactsScreen() {
  const t = await getTranslations("ContactsPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
      <ProseSection>
        <p>{t("email")}</p>
        <p>{t("phone")}</p>
        {SOCIAL_LINKS.map((social) => (
          <p key={social.key}>
            {t.rich(social.key, {
              handle: social.handle,
              link: (chunks) => (
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        ))}
        <p className="text-sm text-muted-foreground">{t("hours")}</p>
      </ProseSection>
    </>
  );
}
