import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required Supabase environment variables");
}

if (!supabaseServiceKey) {
  throw new Error("Missing Supabase service role key for integration tests");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseServiceClient = createClient(
  supabaseUrl,
  supabaseServiceKey
);
