import "server-only";
import { env } from "@/env";

// Vendor photos live in this public Supabase Storage bucket; the old import script used the same one.
const BUCKET = "vendors";

function config() {
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = env;
  if (!url || !key)
    throw new Error("Supabase Storage is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  return { storageUrl: `${url.replace(/\/$/, "")}/storage/v1`, key };
}

function authHeaders(key: string): Record<string, string> {
  // Legacy service keys are JWTs and also go in Authorization; the newer sb_secret_ keys only in apikey.
  const headers: Record<string, string> = { apikey: key };
  if (key.split(".").length === 3) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export function publicUrl(path: string): string {
  return `${config().storageUrl}/object/public/${BUCKET}/${path}`;
}

// The object path inside the bucket for one of our public URLs, or null for anything else.
export function pathFromPublicUrl(url: string): string | null {
  const prefix = `${config().storageUrl}/object/public/${BUCKET}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

// A one-off URL the browser uploads a file to directly, so large photos never pass through our server.
export async function createSignedUploadUrl(path: string): Promise<string> {
  const { storageUrl, key } = config();
  const response = await fetch(`${storageUrl}/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: authHeaders(key),
  });
  if (!response.ok)
    throw new Error(`Signing an upload for ${path} failed: ${response.status} ${await response.text()}`);
  const { url } = (await response.json()) as { url: string };
  return `${storageUrl}${url}`;
}

export async function objectExists(path: string): Promise<boolean> {
  const { storageUrl, key } = config();
  const response = await fetch(`${storageUrl}/object/info/${BUCKET}/${path}`, { headers: authHeaders(key) });
  return response.ok;
}

export async function removeObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { storageUrl, key } = config();
  const response = await fetch(`${storageUrl}/object/${BUCKET}`, {
    method: "DELETE",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!response.ok) throw new Error(`Removing ${paths.join(", ")} failed: ${response.status} ${await response.text()}`);
}
