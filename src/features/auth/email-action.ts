"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient, isAuthApiError } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/env";
import { toLocale } from "@/i18n/routing";
import { clientIp } from "@/shared/lib/client-ip";
import { prisma } from "@/shared/lib/db";
import { saltedHash } from "@/shared/lib/salted-hash";
import { authCallbackUrl } from "./routes";
import { supabaseAuthConfig } from "./supabase";

// `attempt` changes on every submit, so the form can give Turnstile a fresh, unused token.
export type EmailLinkState = { attempt: number; email: string } & (
  { status: "idle" | "sent" } | { status: "invalid" | "captcha" | "limited" | "error" }
);

// On top of Supabase's own hourly cap on all auth emails: one visitor or one address cannot use it up.
const LIMITS = { perVisitor: 5, perEmail: 3, windowMs: 60 * 60 * 1000 };

const emailSchema = z.email().max(254);

export async function requestEmailLink(previous: EmailLinkState, formData: FormData): Promise<EmailLinkState> {
  const attempt = previous.attempt + 1;
  const email = (formData.get("email")?.toString() ?? "").trim().toLowerCase();
  const locale = toLocale(formData.get("locale")?.toString());
  // Turnstile adds this field to the form; Supabase checks it with the secret key.
  const captchaToken = formData.get("cf-turnstile-response")?.toString();

  if (!emailSchema.safeParse(email).success) return { status: "invalid", email, attempt };
  if (!captchaToken) return { status: "captcha", email, attempt };

  const requestHeaders = await headers();
  const visitorHash = saltedHash(clientIp(requestHeaders));
  const emailHash = saltedHash(email);
  const since = new Date(Date.now() - LIMITS.windowMs);
  let reservationId: string | null = null;

  try {
    // Reserve first, then count including the reservation: parallel requests see each other,
    // so they cannot all slip under the limit together.
    reservationId = (await prisma.authEmailRequest.create({ data: { visitorHash, emailHash }, select: { id: true } }))
      .id;
    const [byVisitor, byEmail] = await Promise.all([
      prisma.authEmailRequest.count({ where: { visitorHash, createdAt: { gte: since } } }),
      prisma.authEmailRequest.count({ where: { emailHash, createdAt: { gte: since } } }),
    ]);
    if (byVisitor > LIMITS.perVisitor || byEmail > LIMITS.perEmail)
      return release({ status: "limited", email, attempt });

    // A client without cookies: the email carries a token, not a PKCE code, so nothing has to be kept
    // in this browser and the link also works when opened on another device.
    const { url, key } = supabaseAuthConfig();
    const supabase = createClient(url, key, {
      auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: authCallbackUrl(requestHeaders.get("origin") ?? env.NEXT_PUBLIC_APP_URL, locale),
        captchaToken,
      },
    });
    if (error) {
      if (isAuthApiError(error) && error.code === "captcha_failed")
        return release({ status: "captcha", email, attempt });
      if (isAuthApiError(error) && error.status === 429) return release({ status: "limited", email, attempt });
      throw error;
    }
  } catch (error) {
    Sentry.captureException(error);
    return release({ status: "error", email, attempt });
  }

  // Only the last hour is ever read; older rows are dropped after the response is sent.
  after(() =>
    prisma.authEmailRequest.deleteMany({ where: { createdAt: { lt: since } } }).catch(Sentry.captureException),
  );
  return { status: "sent", email, attempt };

  // Only a sent email counts against the limits: a failed captcha or a refused request does not.
  async function release(state: EmailLinkState): Promise<EmailLinkState> {
    if (reservationId) {
      await prisma.authEmailRequest.delete({ where: { id: reservationId } }).catch(Sentry.captureException);
    }
    return state;
  }
}
