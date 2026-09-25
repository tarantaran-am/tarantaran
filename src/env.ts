import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  VISITOR_HASH_SALT: z.string().min(32),

  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),

  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  ADMIN_PASSWORD_HASH: z.string().startsWith("scrypt:").optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),

  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SENTRY_DSN: z.url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
