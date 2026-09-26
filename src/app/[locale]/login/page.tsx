import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAccount, getAuthUser } from "@/features/auth/dal";
import { authPageMetadata } from "@/features/auth/metadata";
import { LoginScreen, type LoginError } from "@/features/auth/LoginScreen";

export const generateMetadata = authPageMetadata("login");

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  const locale = await getLocale();
  if (await getAccount()) redirect({ href: "/account", locale });
  // Signed in but never picked couple or vendor: that step is what is left, not signing in again.
  if (await getAuthUser()) redirect({ href: "/signup", locale });
  const { error } = await props.searchParams;
  const known: LoginError | null = error === "google" || error === "link" ? error : null;
  return <LoginScreen error={known} />;
}
