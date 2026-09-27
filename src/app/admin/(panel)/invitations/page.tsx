import type { Metadata } from "next";
import { InvitationListScreen } from "@/features/admin/invitations/InvitationListScreen";

export const metadata: Metadata = { title: "Приглашения" };

export default function AdminInvitationsPage() {
  return <InvitationListScreen />;
}
