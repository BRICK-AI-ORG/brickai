// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
// Restrict CORS to explicit allow-list (defaults to localhost for dev)
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

function buildCorsHeaders(req: Request, allowAny = false) {
  const origin = req.headers.get("origin") ?? "";
  const allow = allowAny || (origin && ALLOWED_ORIGINS.includes(origin));
  return {
    "Access-Control-Allow-Origin": allow ? (origin || "*") : allowAny ? "*" : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Be permissive on preflight to avoid dev-time CORS flakes
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, true) });
  }
  // Enforce CORS allow-list for non-OPTIONS requests
  const origin = req.headers.get("origin") ?? "";
  if (!(origin && ALLOWED_ORIGINS.includes(origin))) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    const { title, description, portfolio_id } = await req.json();

    // Basic input validation to reduce abuse
    if (!title || typeof title !== "string" || title.length > 200) {
      throw new Error("Invalid title");
    }
    if (description && (typeof description !== "string" || description.length > 2000)) {
      throw new Error("Invalid description");
    }
    if (portfolio_id && typeof portfolio_id !== "string") {
      throw new Error("Invalid portfolio_id");
    }

    console.log("🔄 Creating task with AI suggestions...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Validate portfolio ownership if provided
    if (portfolio_id) {
      const { data: portfolio, error: portfolioError } = await supabaseClient
        .from("portfolios")
        .select("portfolio_id, user_id")
        .eq("portfolio_id", portfolio_id)
        .single();
      if (portfolioError || !portfolio || portfolio.user_id !== user.id) {
        throw new Error("Portfolio not found or not owned by user");
      }
    }

    // Create the task
    const { data, error } = await supabaseClient
      .from("tasks")
      .insert({
        title,
        description,
        completed: false,
        status: 'todo',
        user_id: user.id,
        portfolio_id: portfolio_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Get label suggestion from OpenAI (property/admin/finance domain)
    const prompt = `You are classifying property management tasks. Based on the task title: "${title}" and description: "${description}", choose EXACTLY ONE best-fit label from this set:
    maintenance, compliance, finance, admin, lettings, inspection, refurb, legal, operations, tenant.
    Return only the lowercase label, no punctuation or extra words.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 16,
    });

    const suggestedLabel = completion.choices[0].message.content
      ?.toLowerCase()
      .trim();

    console.log(`✨ AI Suggested Label: ${suggestedLabel}`);

    // Validate the label
    const validLabels = [
      "maintenance",
      "compliance",
      "finance",
      "admin",
      "lettings",
      "inspection",
      "refurb",
      "legal",
      "operations",
      "tenant",
      // allow legacy labels to keep old data valid
      "work",
      "personal",
      "priority",
      "shopping",
      "home",
    ];
    const label = validLabels.includes(suggestedLabel) ? suggestedLabel : null;

    // Update the task with the suggested label
    const { data: updatedTask, error: updateError } = await supabaseClient
      .from("tasks")
      .update({ label })
      .eq("task_id", data.task_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify(updatedTask), {
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = (error as any)?.message ?? String(error);
    console.error("Error in create-task-with-ai:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
