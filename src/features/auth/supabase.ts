import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";

export const supabaseAuthConfig = () => ({ url: env.SUPABASE_URL, key: env.SUPABASE_PUBLISHABLE_KEY });

// The session lives in Supabase's cookies and is only ever read on the server: the browser never
// gets a Supabase client or key.
export async function createSupabaseServerClient() {
  const { url, key } = supabaseAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the session before they run.
        }
      },
    },
  });
}
