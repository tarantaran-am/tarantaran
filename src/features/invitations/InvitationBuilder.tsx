"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DateInput } from "@/shared/components/ui/date-input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "cn";
import { publishInvitation, saveInvitation, unpublishInvitation } from "./actions";
import {
  INVITATION_LANGUAGES,
  INVITATION_TEMPLATES,
  MAX_SCHEDULE_ITEMS,
  invalidFields,
  type InvitationDraft,
  type InvitationField,
} from "./content";
import { AfterPublish } from "./AfterPublish";
import { InvitationPage } from "./InvitationPage";
import {
  clearLocalDraft,
  markPublishAfterSignIn,
  readLocalDraft,
  wantsPublishAfterSignIn,
  writeLocalDraft,
} from "./local-draft";
import { PhotoField } from "./PhotoField";
import { PublishedPanel } from "./PublishedPanel";
import { slugFromNames } from "./slug";
import { RsvpForm } from "./RsvpForm";
import { THEMES } from "./themes";
import type { InvitationMessages } from "./translator";
import { viewFromDraft } from "./view";

const LANGUAGE_NAMES = { hy: "Հայերեն", ru: "Русский", en: "English" } as const;

// A saved invitation, when editing one; absent for a new one.
export type SavedInvitation = { id: string; slug: string | null; isPublished: boolean; isBlocked: boolean };

type Props = {
  initial: InvitationDraft;
  saved?: SavedInvitation;
  photoUrl?: string;
  signedIn: boolean;
  messagesByLanguage: Record<(typeof INVITATION_LANGUAGES)[number], InvitationMessages>;
};

const subscribeNothing = () => () => {};

// A new invitation starts from the browser's draft, which only exists in the browser: render once
// mounted rather than hydrate a form the server filled differently.
export function InvitationBuilder(props: Props) {
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (!mounted) return <div className="min-h-[80svh]" />;
  return <Builder {...props} initial={props.saved ? props.initial : (readLocalDraft() ?? props.initial)} />;
}

function Builder({ initial, saved, photoUrl: initialPhoto, signedIn, messagesByLanguage }: Props) {
  const t = useTranslations("Invitations");
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [photoUrl, setPhotoUrl] = useState(initialPhoto);
  const [invalid, setInvalid] = useState<InvitationField[]>([]);
  const [message, setMessage] = useState<"saved" | "invalid" | "limit" | "blocked" | "error" | null>(null);
  const [liveSlug, setLiveSlug] = useState(saved?.isPublished ? saved.slug : null);
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [pending, startTransition] = useTransition();

  // A guest's draft is kept in the browser as they type; a saved invitation lives in the database.
  useEffect(() => {
    if (!saved) writeLocalDraft(draft);
  }, [draft, saved]);

  const set = <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  async function save(): Promise<string | null> {
    const result = await saveInvitation(saved?.id ?? null, draft);
    if ("error" in result) {
      setInvalid(result.error === "invalid" ? result.invalid : []);
      setMessage(result.error);
      return null;
    }
    setInvalid([]);
    return result.id;
  }

  function handleSave() {
    startTransition(async () => {
      const id = await save();
      if (!id) return;
      setMessage("saved");
      if (!saved) {
        clearLocalDraft();
        router.replace(`/invitations/${id}`);
      }
    });
  }

  function handlePublish() {
    if (!signedIn) {
      // Check the form before sending them off to sign in, not after they come back.
      const bad = invalidFields(draft);
      if (bad.length > 0) {
        setInvalid(bad);
        setMessage("invalid");
        return;
      }
      markPublishAfterSignIn();
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const id = await save();
      if (!id) return;
      const result = await publishInvitation(id);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      if (saved) {
        setLiveSlug(result.slug);
        return;
      }
      clearLocalDraft();
      router.replace(`/invitations/${id}`);
    });
  }

  // Back from signing in with a guest draft: finish what "Publish" started, once.
  const autoPublished = useRef(false);
  const publishAfterSignIn = useEffectEvent(() => {
    if (autoPublished.current || saved || !signedIn || !wantsPublishAfterSignIn()) return;
    autoPublished.current = true;
    handlePublish();
  });
  useEffect(() => publishAfterSignIn(), []);

  function handleUnpublish() {
    if (!saved) return;
    startTransition(async () => {
      await unpublishInvitation(saved.id);
      setLiveSlug(null);
    });
  }

  const view = viewFromDraft(draft, photoUrl, {
    partnerOne: t("placeholders.partnerOne"),
    partnerTwo: t("placeholders.partnerTwo"),
    venueName: t("placeholders.venueName"),
  });
  const messages = messagesByLanguage[draft.language];
  const isInvalid = (field: InvitationField) => invalid.includes(field) || undefined;
  const liveUrl = liveSlug ? `${window.location.origin}/i/${liveSlug}` : null;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
      <div className="flex rounded-full bg-muted p-1 lg:hidden">
        {(["editor", "preview"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "h-9 flex-1 rounded-full text-sm transition-colors",
              tab === value ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {t(value)}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col gap-6", tab === "preview" && "hidden lg:flex")}>
        {liveUrl && <PublishedPanel url={liveUrl} />}

        <Group title={t("design")}>
          <Field label={t("template")}>
            <div className="grid grid-cols-3 gap-2">
              {INVITATION_TEMPLATES.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => set("template", template)}
                  aria-pressed={draft.template === template}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-[13px] transition-colors",
                    draft.template === template
                      ? "border-foreground bg-muted/60 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {t(`templates.${template}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t("language")}>
            <div className="grid grid-cols-3 gap-2">
              {INVITATION_LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => set("language", language)}
                  aria-pressed={draft.language === language}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-[13px] transition-colors",
                    draft.language === language
                      ? "border-foreground bg-muted/60 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {LANGUAGE_NAMES[language]}
                </button>
              ))}
            </div>
          </Field>
        </Group>

        <Group title={t("couple")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("partnerOne")}>
              <Input
                value={draft.partnerOne}
                maxLength={40}
                placeholder={t("placeholders.partnerOne")}
                aria-invalid={isInvalid("partnerOne")}
                onChange={(event) => set("partnerOne", event.target.value)}
              />
            </Field>
            <Field label={t("partnerTwo")}>
              <Input
                value={draft.partnerTwo}
                maxLength={40}
                placeholder={t("placeholders.partnerTwo")}
                aria-invalid={isInvalid("partnerTwo")}
                onChange={(event) => set("partnerTwo", event.target.value)}
              />
            </Field>
          </div>
        </Group>

        <Group title={t("when")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Field label={t("date")}>
              <DateInput
                value={draft.date}
                aria-invalid={isInvalid("date")}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label={t("time")}>
              <Input
                type="time"
                value={draft.time}
                aria-invalid={isInvalid("time")}
                onChange={(event) => set("time", event.target.value)}
              />
            </Field>
          </div>
        </Group>

        <Group title={t("venue")}>
          <Field label={t("venueName")}>
            <Input
              value={draft.venueName}
              maxLength={80}
              aria-invalid={isInvalid("venueName")}
              onChange={(event) => set("venueName", event.target.value)}
            />
          </Field>
          <Field label={t("venueAddress")}>
            <Input
              value={draft.venueAddress ?? ""}
              maxLength={160}
              aria-invalid={isInvalid("venueAddress")}
              onChange={(event) => set("venueAddress", event.target.value)}
            />
          </Field>
          <Field label={t("mapUrl")} hint={t("mapHint")}>
            <Input
              type="url"
              inputMode="url"
              value={draft.mapUrl ?? ""}
              placeholder="https://maps.app.goo.gl/…"
              aria-invalid={isInvalid("mapUrl")}
              onChange={(event) => set("mapUrl", event.target.value)}
            />
          </Field>
        </Group>

        <Group title={t("photo")}>
          {saved ? (
            <PhotoField invitationId={saved.id} photoUrl={photoUrl} onChange={setPhotoUrl} />
          ) : (
            <p className="text-sm text-muted-foreground">{signedIn ? t("photoSaveFirst") : t("photoSignIn")}</p>
          )}
        </Group>

        <Group title={t("message")}>
          <Textarea
            rows={4}
            maxLength={600}
            className="min-h-28 px-4 py-3"
            value={draft.message ?? ""}
            placeholder={t("messagePlaceholder")}
            aria-label={t("message")}
            aria-invalid={isInvalid("message")}
            onChange={(event) => set("message", event.target.value)}
          />
        </Group>

        <Group title={t("schedule")}>
          {draft.schedule.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="time"
                value={item.time}
                className="w-28 shrink-0"
                aria-label={t("time")}
                onChange={(event) =>
                  set(
                    "schedule",
                    draft.schedule.map((entry, i) => (i === index ? { ...entry, time: event.target.value } : entry)),
                  )
                }
              />
              <Input
                value={item.title}
                maxLength={80}
                placeholder={t("itemPlaceholder")}
                aria-label={t("itemLabel")}
                aria-invalid={isInvalid("schedule")}
                onChange={(event) =>
                  set(
                    "schedule",
                    draft.schedule.map((entry, i) => (i === index ? { ...entry, title: event.target.value } : entry)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("removeItem")}
                onClick={() =>
                  set(
                    "schedule",
                    draft.schedule.filter((_, i) => i !== index),
                  )
                }
              >
                <X />
              </Button>
            </div>
          ))}
          {draft.schedule.length < MAX_SCHEDULE_ITEMS && (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 self-start"
              onClick={() => set("schedule", [...draft.schedule, { time: draft.time || "16:00", title: "" }])}
            >
              <Plus />
              {t("addItem")}
            </Button>
          )}
        </Group>

        <Group title={t("dressCode")}>
          <Input
            value={draft.dressCode ?? ""}
            maxLength={200}
            aria-label={t("dressCode")}
            aria-invalid={isInvalid("dressCode")}
            onChange={(event) => set("dressCode", event.target.value)}
          />
        </Group>

        <Group title={t("rsvpDeadline")}>
          <Field hint={t("rsvpDeadlineHint")}>
            <DateInput
              value={draft.rsvpDeadline ?? ""}
              className="max-w-48"
              aria-label={t("rsvpDeadline")}
              aria-invalid={isInvalid("rsvpDeadline")}
              onChange={(event) => set("rsvpDeadline", event.target.value)}
            />
          </Field>
        </Group>

        {!liveSlug && (
          <AfterPublish
            url={`${window.location.host}/i/${
              saved?.slug ??
              slugFromNames(
                draft.partnerOne.trim() || t("placeholders.partnerOne"),
                draft.partnerTwo.trim() || t("placeholders.partnerTwo"),
              )
            }`}
          />
        )}

        <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur md:mx-0 md:rounded-[20px] md:border">
          {message && message !== "saved" && (
            <p role="alert" className="text-sm text-destructive">
              {t(`errors.${message}`)}
            </p>
          )}
          {!signedIn && <p className="text-[13px] text-muted-foreground">{t("signInToPublish")}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {signedIn && (
              <Button type="button" variant="outline" size="lg" disabled={pending} onClick={handleSave}>
                {pending ? t("saving") : message === "saved" ? t("saved") : t("save")}
              </Button>
            )}
            {liveSlug ? (
              <Button type="button" variant="ghost" size="lg" disabled={pending} onClick={handleUnpublish}>
                {t("unpublish")}
              </Button>
            ) : (
              <Button type="button" size="lg" disabled={pending || saved?.isBlocked} onClick={handlePublish}>
                {pending ? t("publishing") : signedIn ? t("publish") : t("signInAndPublish")}
              </Button>
            )}
            {saved && (
              <Link
                href={`/invitations/${saved.id}/guests`}
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("guests")}
              </Link>
            )}
          </div>
          {!saved && <p className="text-xs text-muted-foreground">{t("localSaved")}</p>}
        </div>
      </div>

      <div className={cn("lg:sticky lg:top-[100px] lg:self-start", tab === "editor" && "hidden lg:block")}>
        <div className="mx-auto h-[760px] max-h-[80svh] w-full max-w-[400px] overflow-y-auto rounded-[40px] border-[10px] border-foreground/90 bg-background shadow-xl">
          <InvitationPage
            view={view}
            messages={messages}
            isPast={false}
            screenHeight="min(740px, 80svh - 20px)"
            rsvp={<RsvpForm slug={null} view={view} messages={messages} theme={THEMES[view.template]} />}
            footer={null}
          />
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-border p-5 md:p-6">
      <h2 className="text-[15px] font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      {label && <span className="text-sm text-foreground">{label}</span>}
      {children}
      {hint && <span className="text-xs leading-relaxed text-muted-foreground">{hint}</span>}
    </label>
  );
}
