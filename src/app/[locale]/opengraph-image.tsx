import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { toLocale } from "@/i18n/routing";
import { SITE_URL } from "@/shared/config/seo";
import { loadGoogleFont } from "@/shared/lib/og-font";
import { RingsMark } from "@/shared/components/RingsMark";

// The default share image for every page that doesn't set its own (vendors, categories and posts do).

const size = { width: 1200, height: 630 };

const SHADE = "rgba(18, 16, 17, 0.62)";

export async function generateImageMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: toLocale(params.locale), namespace: "Metadata" });
  return [{ id: "default", alt: t("title"), size, contentType: "image/png" }];
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const [tBrand, tHero] = await Promise.all([
    getTranslations({ locale, namespace: "Brand" }),
    getTranslations({ locale, namespace: "Hero" }),
  ]);

  const wordmark = tBrand("wordmark");
  const tagline = tHero("eyebrow");
  const host = new URL(SITE_URL).host;

  const serif = locale === "hy" ? "Noto Serif Armenian" : "Playfair Display";

  const [photo, serifFont, hostFont] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og-photo.jpg")),
    loadGoogleFont(serif, 400, wordmark + tagline),
    // The host is Latin in every locale, which the Armenian fonts don't cover.
    loadGoogleFont("Manrope", 500, host),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", color: "#ffffff" }}>
      <img
        src={`data:image/jpeg;base64,${photo.toString("base64")}`}
        alt=""
        width={size.width}
        height={size.height}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
      {/* Darkest on the left, where the text sits; the couple on the right stays visible. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(90deg, ${SHADE} 0%, rgba(18, 16, 17, 0.4) 55%, rgba(18, 16, 17, 0.15) 100%)`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", position: "relative", padding: "84px 80px 64px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontFamily: serif,
            fontSize: 46,
            letterSpacing: "0.18em",
          }}
        >
          <span>{wordmark}</span>
          <RingsMark width={84} height={85} fill="#ffffff" />
          <span>{wordmark}</span>
        </div>
        <div style={{ marginTop: 28, fontFamily: serif, fontSize: 40, opacity: 0.92 }}>{tagline}</div>

        <div style={{ marginTop: "auto", fontFamily: "Host", fontSize: 22, letterSpacing: "0.04em", opacity: 0.8 }}>
          {host}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: serif, data: serifFont, weight: 400, style: "normal" },
        { name: "Host", data: hostFont, weight: 500, style: "normal" },
      ],
    },
  );
}
