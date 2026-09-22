import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/PageHeader";
import { getRequestLocale } from "@/i18n/locale";

const NAMESPACE = { terms: "TermsPage", privacy: "PrivacyPage" } as const;

export async function LegalScreen({ doc }: { doc: keyof typeof NAMESPACE }) {
  const locale = await getRequestLocale();
  const t = await getTranslations(NAMESPACE[doc]);
  const { default: Content } = await import(`@/content/legal/${doc}/${locale}.mdx`);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
      <div className="mx-auto max-w-[820px] px-6 pb-24 md:px-10 md:pb-32 lg:px-16 xl:px-20">
        <Content />
      </div>
    </>
  );
}
