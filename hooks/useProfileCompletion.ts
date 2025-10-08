"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type BillingAddressInput = {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postal_code: string;
  country?: string; // ISO-2; default to GB
};

export type ProfileCompletionStatus = {
  hasFullName: boolean;
  hasDob: boolean;
  hasBilling: boolean;
  complete: boolean;
};

export function useProfileCompletion() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    hasFullName: false,
    hasDob: false,
    hasBilling: false,
    complete: false,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus({ hasFullName: false, hasDob: false, hasBilling: false, complete: false });
        setLoading(false);
        return;
      }

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("full_name, name, date_of_birth")
        .eq("user_id", user.id)
        .maybeSingle();
      if (pErr) throw pErr;

      const fullName = (profile as any)?.full_name ?? (profile as any)?.name ?? "";
      const hasFullName = typeof fullName === "string" && fullName.trim().length > 0;
      const dobVal = (profile as any)?.date_of_birth as string | null | undefined;
      const hasDob = !!dobVal && new Date(dobVal).getTime() <= Date.now();

      const { data: pa, error: paErr } = await supabase
        .from("profile_addresses")
        .select("profile_address_id")
        .eq("user_id", user.id)
        .eq("kind", "billing")
        .eq("is_primary", true)
        .is("valid_to", null)
        .limit(1)
        .maybeSingle();
      if (paErr && paErr.code !== "PGRST116") throw paErr; // ignore no rows
      const hasBilling = !!pa;

      setStatus({ hasFullName, hasDob, hasBilling, complete: hasFullName && hasDob && hasBilling });
    } catch (e: any) {
      setError(e.message || "Failed to check profile status");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfileBasics = useCallback(
    async (full_name: string, date_of_birth: string) => {
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload: any = { full_name: full_name.trim() };
      if (date_of_birth) payload.date_of_birth = date_of_birth;

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", user.id);
      if (error) throw error;
      await refresh();
    },
    [supabase, refresh]
  );

  const upsertPrimaryBillingAddress = useCallback(
    async (addr: BillingAddressInput) => {
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert or reuse canonical address (unique on address_hash)
      const { data: rpcId, error: rpcErr } = await supabase.rpc("get_or_create_address", {
        p_line1: addr.line1,
        p_line2: addr.line2 ?? null,
        p_city: addr.city,
        p_region: addr.region ?? null,
        p_postal_code: addr.postal_code,
        p_country: (addr.country ?? "GB").toUpperCase(),
      });
      if (rpcErr) throw rpcErr;
      const address_id = rpcId as unknown as string;

      // Avoid overlap with exclusion constraint by ending previous row slightly before the new start
      const now = new Date();
      const startIso = now.toISOString();
      const endPrevIso = new Date(now.getTime() - 1000).toISOString();

      // Close current primary
      await supabase
        .from("profile_addresses")
        .update({ valid_to: endPrevIso, is_primary: false })
        .eq("user_id", user.id)
        .eq("kind", "billing")
        .eq("is_primary", true)
        .is("valid_to", null);

      // Insert new primary
      const ins = await supabase.from("profile_addresses").insert({
        user_id: user.id,
        address_id,
        kind: "billing",
        is_primary: true,
        valid_from: startIso,
      } as any);
      if (ins.error) throw ins.error;

      await refresh();
    },
    [supabase, refresh]
  );

  return {
    loading,
    error,
    status,
    refresh,
    saveProfileBasics,
    upsertPrimaryBillingAddress,
  };
}
