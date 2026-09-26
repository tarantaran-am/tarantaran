import * as Sentry from "@sentry/nextjs";
import { isProductionDeployment } from "./shared/config/deployment";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isProductionDeployment,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
