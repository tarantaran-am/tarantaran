import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { authPageMetadata } from "@/features/auth/metadata";
import { ConfirmScreen } from "@/features/auth/ConfirmScreen";

export const generateMetadata = authPageMetadata("confirm");

export default async function ConfirmPage(props: PageProps<"/[locale]/login/confirm">) {
  const { token_hash: tokenHash } = await props.searchParams;
  if (typeof tokenHash === "string" && tokenHash) return <ConfirmScreen tokenHash={tokenHash} />;
  redirect({ href: "/login", locale: await getLocale() });
}
