import type { Database } from "@/lib/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientMode = "browser" | "service";

export interface SupabaseClientFactoryOptions {
  mode?: SupabaseClientMode;
  serviceKey?: string;
  accessToken?: string;
}

export class SupabaseClientFactory {
  public static create(options: SupabaseClientFactoryOptions = {}): SupabaseClient {
    const mode = options.mode ?? "browser";
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error("Supabase URL is not configured.");
    }

    if (mode === "service") {
      const serviceKey =
        options.serviceKey ??
        process.env.SUPABASE_SERVICE_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        throw new Error("Supabase service key is required for service clients.");
      }

      return createClient<Database>(
        supabaseUrl,
        serviceKey,
        {
          global: options.accessToken
            ? {
                headers: {
                  Authorization: `Bearer ${options.accessToken}`,
                },
              }
            : undefined,
        }
      ) as unknown as SupabaseClient;
    }

    const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!publicUrl || !publicAnonKey) {
      throw new Error("Supabase public client environment variables are not configured.");
    }

    return createBrowserClient<Database>(
      publicUrl,
      publicAnonKey
    ) as unknown as SupabaseClient;
  }
}








