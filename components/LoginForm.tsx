import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";

type Mode = "login" | "signup";

const LoginForm = ({ mode = "login" }: { mode?: Mode }) => {
  const {
    email,
    password,
    handleLogin,
    handleGoogleLogin,
    handleSignup,
    setEmail,
    setPassword,
    error,
    notice,
    isSignUpMode,
    setIsSignUpMode,
    clearError,
    isAuthBusy,
    resendConfirmation,
  } = useAuth();

  // Local UI state for signup validation
  const [confirmPassword, setConfirmPassword] = useState("");

  type Strength = "Poor" | "Good" | "Very Good";
  const passwordStrength: Strength = useMemo(() => {
    const p = password || "";
    const length = p.length;
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /\d/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);
    const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean)
      .length;

    if (length >= 12 && variety === 4) return "Very Good";
    if (length >= 8 && variety >= 3) return "Good";
    return "Poor";
  }, [password]);

  const canSubmitSignup = useMemo(() => {
    return (
      isSignUpMode &&
      passwordStrength !== "Poor" &&
      password.length >= 8 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [isSignUpMode, passwordStrength, password, confirmPassword]);

  const strengthPercent = useMemo(() => {
    switch (passwordStrength) {
      case "Very Good":
        return 100;
      case "Good":
        return 66;
      default:
        return password ? 33 : 0;
    }
  }, [passwordStrength, password]);

  // Ensure the UI matches the page's desired mode
  useEffect(() => {
    setIsSignUpMode(mode === "signup");
    // Intentionally avoid depending on clearError/setter identities to prevent
    // clearing errors after every render.
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <section aria-label={isSignUpMode ? "Sign Up Form" : "Login Form"}>
      {isSignUpMode && notice ? (
        <div className="max-w-md mx-auto" data-confirm-email>
          
              <h1 className="text-2xl font-bold mb-3 text-center">Check your email</h1>
              <div className="text-[#aa2ee2] text-sm text-center mb-3">{notice}</div>
              <ul className="list-disc text-sm text-muted-foreground text-left space-y-1 pl-5">
                <li>Confirmation email is sent by Supabase.</li>
                <li>Open the link in the same browser window (new tab is fine).</li>
                <li>Keep this tab open for automatic sign-in and redirect to your hub.</li>
                <li>Can’t find it? Check your spam folder.</li>
              </ul>
              <div className="mt-5 flex flex-col items-center gap-3">
                <Button onClick={resendConfirmation} disabled={isAuthBusy} aria-busy={isAuthBusy}>
                  Resend confirmation email
                </Button>
                <Link href="/contact" className="text-sm underline text-white/80 hover:text-white">
                  Still need help?
                </Link>
              </div>
          
        </div>
      ) : (
        <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isSignUpMode ? "Create Account" : "Welcome Back"}
        </h1>
        <div className="space-y-4">
          <Button className="w-full" onClick={handleGoogleLogin} disabled={isAuthBusy} aria-busy={isAuthBusy}>
            <LogIn className="mr-2 h-4 w-4" />
            {isSignUpMode ? "Sign up with Google" : "Login with Google"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <form
            onSubmit={
              isSignUpMode
                ? (e) => {
                    e.preventDefault();
                    handleSignup();
                  }
                : handleLogin
            }
            className="space-y-4"
          >
            <div className="relative">
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="username email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <Input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {isSignUpMode && (
              <>
                <div className="mt-1" aria-live="polite">
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div
                      className={
                        "h-2 rounded transition-all " +
                        (passwordStrength === "Very Good"
                          ? "bg-green-600"
                          : passwordStrength === "Good"
                          ? "bg-yellow-500"
                          : "bg-red-500")
                      }
                      style={{ width: `${strengthPercent}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    {password ? `Password strength: ${passwordStrength}` : ""}
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2" role="alert">
                    Passwords do not match
                  </div>
                )}
              </>
            )}
            {error && (
              <div className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 rounded px-3 py-2 text-center">
                {error}
              </div>
            )}
            {notice && (
              <div className="text-sm text-emerald-300 bg-emerald-900/15 border border-emerald-500/30 rounded px-3 py-2 text-center">
                {notice}
              </div>
            )}
            {isSignUpMode && !canSubmitSignup && (
              <div className="text-xs text-gray-500 text-center">
                Password must be at least 8 characters and include three of: lowercase, uppercase, number, symbol. Passwords must match.
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isAuthBusy || (isSignUpMode ? !canSubmitSignup : false)}
              aria-busy={isAuthBusy}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isSignUpMode ? "Sign Up" : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm">
            {isSignUpMode ? "Already have an account?" : "New account?"}{" "}
            <Link
              href={isSignUpMode ? "/login" : "/create-account"}
              className="underline"
            >
              {isSignUpMode ? "Login" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
      )}
    </section>
  );
};

export default LoginForm;
