import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:3000";
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin));
  return {
    "Access-Control-Allow-Origin": allow ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split(" ")[1] ?? ""
    );

    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      throw new Error("No user found");
    }

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_plan")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.stripe_customer_id) {
      throw new Error("No Stripe customer found");
    }

    const originUrl = APP_URL;

    // Create Portal session if already subscribed
    if (profile.subscription_plan === "premium") {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${originUrl}/profile`,
      });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Create Checkout session for new subscribers
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      line_items: [
        {
          price: STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${originUrl}/profile?success=true`,
      cancel_url: `${originUrl}/profile?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = (error as any)?.message ?? String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

