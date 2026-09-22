import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: true,
  // Adjust based on your traffic volume
  tracesSampleRate: 0.1,
});
