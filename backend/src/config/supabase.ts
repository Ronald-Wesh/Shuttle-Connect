import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { env } from "./env";

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    transport: ws
  }
} as Parameters<typeof createClient>[2];

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase configuration. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  clientOptions
);

export const supabaseAuth = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  clientOptions
);
