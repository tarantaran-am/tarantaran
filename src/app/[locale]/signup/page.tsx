import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAccount, getAuthUser } from "@/features/auth/dal";
import { authPageMetadata } from "@/features/auth/metadata";
import { SignupScreen } from "@/features/auth/SignupScreen";

export const generateMetadata = authPageMetadata("signup");

// Only for someone signed in without an account yet; everyone else starts on the login page.
export default async function SignupPage() {
  const locale = await getLocale();
  if (await getAccount()) redirect({ href: "/account", locale });
  if (!(await getAuthUser())) redirect({ href: "/login", locale });
  return <SignupScreen />;
}
