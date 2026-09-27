import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedInvitation, invitationMessages } from "@/features/invitations/queries";
import { invitationTranslator } from "@/features/invitations/translator";
import { formatWeddingDate, viewFromInvitation } from "@/features/invitations/view";
import { loadGoogleFont } from "@/shared/lib/og-font";

// What WhatsApp and Telegram show under the link: the names, the date, and the couple's photo if there is one.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function InvitationImage({ params }: { params: Promise<{ slug: string }> }) {
  const invitation = await getPublishedInvitation((await params).slug);
  if (!invitation) notFound();

  const view = viewFromInvitation(invitation);
  const t = invitationTranslator(view.language, await invitationMessages(view.language));
  const invite = t("invite");
  const names = `${view.partnerOne} ${t("and")} ${view.partnerTwo}`;
  const date = formatWeddingDate(view.startsAt, view.language).date;
  // The font is fetched with only these characters; the invite line is shown in capitals.
  const text = invite + invite.toLocaleUpperCase(view.language) + names + date;

  // Names can mix scripts: Latin and Cyrillic from Playfair, Armenian from Noto Serif Armenian.
  const [latin, armenian] = await Promise.all([
    loadGoogleFont("Playfair Display", 400, text),
    /\p{Script=Armenian}/u.test(text) ? loadGoogleFont("Noto Serif Armenian", 400, text) : null,
  ]);
  const onPhoto = Boolean(view.photoUrl);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: onPhoto ? "#221d1b" : "#faf6f0",
        color: onPhoto ? "#ffffff" : "#2e2724",
        fontFamily: "Latin, Armenian",
      }}
    >
      {view.photoUrl && (
        <img
          src={view.photoUrl}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {onPhoto && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.1) 100%)",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: onPhoto ? "flex-end" : "center",
          position: "relative",
          width: "100%",
          padding: "72px 80px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.75 }}>{invite}</div>
        <div style={{ marginTop: 28, fontSize: 88, lineHeight: 1.05 }}>{names}</div>
        <div style={{ marginTop: 28, fontSize: 38, color: onPhoto ? "#ffffff" : "#8e3b55" }}>{date}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Latin", data: latin, weight: 400, style: "normal" },
        ...(armenian ? [{ name: "Armenian", data: armenian, weight: 400 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
