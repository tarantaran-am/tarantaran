// Whether this is the production deployment (www.tarantaran.am), as opposed to a preview, the staging
// site or a local build. Vercel sets NEXT_PUBLIC_VERCEL_ENV itself on every deployment; the NEXT_PUBLIC_
// copy is readable on the server and in the browser alike, so one flag serves both. Not NODE_ENV:
// previews are production builds too.
export const isProductionDeployment = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
