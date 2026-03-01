import { createBrowserClient } from "@supabase/ssr";

// Client unique basé sur les cookies (compatible SSR) — partagé avec src/lib/supabase/client.ts
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
