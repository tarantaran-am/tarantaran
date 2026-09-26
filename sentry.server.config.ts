import * as Sentry from "@sentry/nextjs";
import { isProductionDeployment } from "./src/shared/config/deployment";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isProductionDeployment,
  // Adjust based on your traffic volume
  tracesSampleRate: 0.1,
});
