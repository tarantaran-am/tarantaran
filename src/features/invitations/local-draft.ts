import { EMPTY_DRAFT, type InvitationDraft } from "./content";

// A guest builds the invitation before signing in, so the draft lives in the browser until it is
// saved to an account. Storage can be unavailable (private mode, blocked site data): then the draft
// just lasts as long as the page.
const DRAFT_KEY = "tt_invitation_draft";
// Set when a guest presses "Publish": after signing in, the builder saves and publishes the draft.
const PUBLISH_KEY = "tt_invitation_publish";

export function readLocalDraft(): InvitationDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<InvitationDraft>) } : null;
  } catch {
    return null;
  }
}

export function writeLocalDraft(draft: InvitationDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

export function clearLocalDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(PUBLISH_KEY);
  } catch {}
}

export function markPublishAfterSignIn(): void {
  try {
    localStorage.setItem(PUBLISH_KEY, "1");
  } catch {}
}

export function wantsPublishAfterSignIn(): boolean {
  try {
    return localStorage.getItem(PUBLISH_KEY) === "1";
  } catch {
    return false;
  }
}
