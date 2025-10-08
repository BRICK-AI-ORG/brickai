import { useState, useEffect } from "react";
import { User } from "@/types/models";
import { UseAuthReturn } from "@/types/auth";
import { createBrowserClient } from "@supabase/ssr";

export function useAuth(): UseAuthReturn {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // State
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);

  // Helper functions
  const clearError = () => {
    setError(null);
    setNotice(null);
  };
  const clearNotice = () => setNotice(null);

  const resendConfirmation = async () => {
    try {
      if (!email) {
        setError("Please enter your email address");
        return;
      }
      setIsAuthBusy(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/app/hub` },
      } as any);
      if (error) {
        const is429 = (error as any).status === 429;
        const msg =
          (is429 &&
            "Too many requests. Please wait a minute and try again.") ||
          error.message;
        setError(msg);
      } else {
        setNotice(`We resent a confirmation link to ${email}.`);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend confirmation email.");
    } finally {
      setIsAuthBusy(false);
    }
  };

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Try to get the profile; treat 0 rows gracefully
      const profileResponse = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // If no profile row yet (e.g., trigger lagged), try to create one client-side
      if (!profileResponse.data) {
        const { error: insertErr } = await supabase
          .from("profiles")
          .insert({ user_id: userId, name: null });
        if (insertErr) {
          // Log but don't sign the user out; allow app to continue
          console.error("Profile create fallback failed:", insertErr);
        }
      }

      // Fetch usage tracking (optional)
      const usageResponse = await supabase
        .from("usage_tracking")
        .select("tasks_created")
        .eq("user_id", userId)
        .eq("year_month", new Date().toISOString().slice(0, 7))
        .maybeSingle();

      // Fetch profile again (best-effort)
      const finalProfile = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (finalProfile.error) throw finalProfile.error;

      setUser({
        ...(finalProfile.data || { user_id: userId, name: null }),
        email: userEmail,
        tasks_created: usageResponse.data?.tasks_created || 0,
      });
    } catch (error) {
      console.error("Critical error fetching user profile:", error);
      // Do not force sign-out on profile read issues; keep user logged in
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionState = async (newSession: any) => {
    // Validate server-side that the auth user still exists; if not, sign out and clear local token
    if (newSession?.access_token) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          await supabase.auth.signOut();
          newSession = null;
        }
      } catch {
        await supabase.auth.signOut();
        newSession = null;
      }
    }

    setSession(newSession);
    setIsLoggedIn(!!newSession);

    if (newSession?.user) {
      setIsLoading(true);
      await fetchUserProfile(newSession.user.id, newSession.user.email);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Auth methods
  const signOut = async () => {
    try {
      setIsAuthBusy(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
      window.localStorage.removeItem("supabase.auth.token");
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing out:", error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      setIsAuthBusy(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // Map common cases for clarity
        const raw = (error.message || "").toLowerCase();
        const code = (error as any).code || "";
        const status = (error as any).status;
        const is429 = status === 429;
        const is400 = status === 400;
        const invalid = raw.includes("invalid") || raw.includes("credential") || code === "invalid_credentials";
        const unconfirmed = raw.includes("confirm");
        const msg =
          (is429 && "Too many requests. Please wait a minute and try again.") ||
          ((is400 && unconfirmed) &&
            "Please confirm your email before logging in. Check your inbox (and spam).") ||
          ((is400 && invalid) && "Invalid email or password.") ||
          error.message;
        setError(msg);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error logging in:", error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Avoid toggling busy state to prevent UI flash before redirect
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app/hub`,
          queryParams: { prompt: "select_account" },
        },
      });
    } catch (error: any) {
      setError(error.message);
      console.error("Error with Google login:", error);
    }
  };

  const handleSignup = async () => {
    if (isAuthBusy) return; // prevent double submit
    clearError();
    try {
      setIsAuthBusy(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app/hub` },
      });

      if (error) {
        const alreadyExists = /already\s+registered|user.*exists/i.test(error.message || "");
        const msg =
          // @ts-ignore optional status on error
          (error.status === 429 &&
            "Too many requests. Please wait a minute and try again.") ||
          (alreadyExists &&
            "This email is already registered. Please log in or use Google.") ||
          error.message;
        setError(msg);
      } else {
        setNotice(`We sent a confirmation link to ${email}. Please check your inbox to confirm.`);
        setError(null);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing up:", error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // Validate token against server user
        if (session?.access_token) {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data?.user) {
            await supabase.auth.signOut();
          }
        }
        const { data: { session: fresh } } = await supabase.auth.getSession();
        await updateSessionState(fresh);
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        setError(error.message);
        await signOut();
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateSessionState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    // State
    user,
    session,
    email,
    password,
    isLoggedIn,
    isLoading,
    error,
    notice,
    isSignUpMode,
    isAuthBusy,

    // Operations
    signOut,
    handleLogin,
    handleGoogleLogin,
    handleSignup,
    resendConfirmation,
    setEmail,
    setPassword,
    setIsSignUpMode,
    clearError,
    clearNotice,
  };
}
