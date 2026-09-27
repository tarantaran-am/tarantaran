import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  VISITOR_HASH_SALT: z.string().min(32),

  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),

  // Sign-in runs on Supabase Auth, and the header links to it from every page. The service key signs
  // photo uploads to Storage: couples' invitation photos, not just the admin's.
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),

  ADMIN_PASSWORD_HASH: z.string().startsWith("scrypt:").optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),

  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url(),
});

type Env = z.infer<typeof schema>;

function validate(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

// CI checks the code, not the configuration: it runs with a throwaway database, the site URL and no
// real secrets, so it skips validation. Keyed to GitHub Actions itself rather than a flag of our own,
// so it cannot be switched off by mistake where the site runs; Vercel still validates everything.
export const env: Env = process.env.GITHUB_ACTIONS === "true" ? (process.env as unknown as Env) : validate();
