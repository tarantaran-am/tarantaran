import { requireAccount } from "@/features/auth/dal";
import { authPageMetadata } from "@/features/auth/metadata";
import { AccountScreen } from "@/features/auth/AccountScreen";

export const generateMetadata = authPageMetadata("account");

export default async function AccountPage() {
  return <AccountScreen account={await requireAccount()} />;
}
