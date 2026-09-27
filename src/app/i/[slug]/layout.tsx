import type { Metadata } from "next";
import { cn } from "cn";
import { fontVariables } from "@/app/fonts";
import { getPublishedInvitation } from "@/features/invitations/queries";
import "../../globals.css";

// Invitations are pages of their own: no site header or footer, in the invitation's language rather
// than the site's, and out of search, since only the guests who got the link should find them. The
// root layout sits under [slug] to know that language (the query is cached for the page too).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitationRootLayout({ children, params }: LayoutProps<"/i/[slug]">) {
  const invitation = await getPublishedInvitation((await params).slug);
  return (
    <html lang={invitation?.language ?? "hy"} className={cn("h-full antialiased", fontVariables)}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
