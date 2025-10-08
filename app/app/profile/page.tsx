"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FunLoader from "@/components/FunLoader";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function Profile() {
  const { user, isLoading, isLoggedIn, signOut, session } = useAuth();
  const { manageSubscription } = useSubscription();
  const supabase = React.useMemo(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
  []);

  type AddressLink = {
    profile_address_id: string;
    kind: string;
    is_primary: boolean;
    valid_from: string;
    valid_to: string | null;
    addresses?: {
      line1: string;
      line2: string | null;
      city: string;
      region: string | null;
      postal_code: string;
      country: string;
    } | null;
  };

  const [addrLoading, setAddrLoading] = React.useState(true);
  const [addr, setAddr] = React.useState<AddressLink[]>([]);
  const [profileRow, setProfileRow] = React.useState<any | null>(null);
  const [fetchedAt, setFetchedAt] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth?.user;
      if (!authUser) {
        setAddr([]);
        setProfileRow(null);
        setFetchedAt(new Date().toISOString());
        return;
      }
      // Load profile basics explicitly to ensure fresh fields (e.g., DOB)
      const prof = await supabase
        .from("profiles")
        .select("full_name, name, date_of_birth, created_at, updated_at")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (!prof.error) setProfileRow(prof.data || null);
      const { data, error } = await supabase
        .from("profile_addresses")
        .select(
          "profile_address_id, kind, is_primary, valid_from, valid_to, addresses:addresses (line1, line2, city, region, postal_code, country)"
        )
        .eq("user_id", authUser.id);
      if (!error) setAddr((data as any) || []);
    } finally {
      setAddrLoading(false);
      setFetchedAt(new Date().toISOString());
    }
  }, [supabase]);

  React.useEffect(() => {
    setAddrLoading(true);
    load();
  }, [load]);

  React.useEffect(() => {
    const onFocus = () => { load(); };
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  React.useEffect(() => {
    // no-op here; guarded by app/app/layout.tsx
  }, []);

  if (isLoading || !user) {
    return <FunLoader />;
  }
  const fullName = (profileRow?.full_name as string | undefined) || user.name || "";
  const dob = (profileRow?.date_of_birth as string | null | undefined);
  const createdAt = (profileRow?.created_at as string | null | undefined) ?? ((user as any)?.created_at as string | null | undefined);
  const updatedAt = (profileRow?.updated_at as string | null | undefined) ?? ((user as any)?.updated_at as string | null | undefined);

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";

  const current = addr.filter((a) => !a.valid_to);
  const previous = addr.filter((a) => !!a.valid_to);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-white/70">Full name:</span> {fullName || "—"}</p>
          {user.name && fullName && user.name !== fullName && (
            <p><span className="text-white/70">Preferred name:</span> {user.name}</p>
          )}
          <p><span className="text-white/70">Date of birth:</span> {dob ? formatDate(dob) : "—"}</p>
          <p><span className="text-white/70">Email:</span> {user.email}</p>
          {createdAt && <p><span className="text-white/70">Account created:</span> {formatDate(createdAt)}</p>}
          {/* Intentionally omit inline last-updated line */}
          {fetchedAt && (
            <p className="text-xs text-white/60 mt-5">
              This information was last updated on {new Date(fetchedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}, {new Date(fetchedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Addresses</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          {addrLoading ? (
            <div className="text-white/80">Loading addresses…</div>
          ) : addr.length === 0 ? (
            <div className="text-white/60">No addresses on file.</div>
          ) : (
            <>
              {current.length > 0 && (
                <div>
                  <div className="text-white/80 font-medium mb-2">Current</div>
                  <div className="space-y-3">
                    {current.map((a) => (
                      <div key={a.profile_address_id} className="bg-white/5 border border-white/10 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="capitalize">{a.kind}</div>
                          {a.is_primary && <span className="text-xs text-white/70">Primary</span>}
                        </div>
                        <div className="text-white/90">
                          {a.addresses?.line1}
                          {a.addresses?.line2 ? `, ${a.addresses.line2}` : ''}
                          {a.addresses?.city ? `, ${a.addresses.city}` : ''}
                          {a.addresses?.region ? `, ${a.addresses.region}` : ''}
                          {a.addresses?.postal_code ? ` ${a.addresses.postal_code}` : ''}
                          {a.addresses?.country ? `, ${a.addresses.country.toUpperCase()}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previous.length > 0 && (
                <div>
                  <div className="text-white/80 font-medium mt-2 mb-2">Previous</div>
                  <div className="space-y-3">
                    {previous.map((a) => (
                      <div key={a.profile_address_id} className="bg-white/5 border border-white/10 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="capitalize">{a.kind}</div>
                          <span className="text-xs text-white/60">Ended {formatDate(a.valid_to)}</span>
                        </div>
                        <div className="text-white/90">
                          {a.addresses?.line1}
                          {a.addresses?.line2 ? `, ${a.addresses.line2}` : ''}
                          {a.addresses?.city ? `, ${a.addresses.city}` : ''}
                          {a.addresses?.region ? `, ${a.addresses.region}` : ''}
                          {a.addresses?.postal_code ? ` ${a.addresses.postal_code}` : ''}
                          {a.addresses?.country ? `, ${a.addresses.country.toUpperCase()}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p>Current Plan: {user.subscription_plan}</p>
            <p>
              Tasks Created: {user.tasks_created} / {user.tasks_limit}
            </p>
          </div>
          <Button onClick={() => manageSubscription(session?.access_token)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
