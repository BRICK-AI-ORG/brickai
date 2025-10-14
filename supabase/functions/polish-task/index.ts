// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  } as Record<string, string>;
}

type Payload = {
  task_id: string;
  title?: string | null;
  description?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, true) });
  }
  const origin = req.headers.get("origin") ?? "";
  if (!(origin && ALLOWED_ORIGINS.includes(origin))) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const { task_id, title, description } = (await req.json()) as Payload;
    if (!task_id) throw new Error("Missing task_id");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // Fetch the task to verify ownership
    const { data: task, error: tErr } = await supabase
      .from("tasks")
      .select("task_id, user_id, title, description")
      .eq("task_id", task_id)
      .single();
    if (tErr || !task) throw new Error("Task not found");
    if (task.user_id !== user.id) throw new Error("Forbidden");

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const baseTitle = (title ?? task.title ?? "").slice(0, 200);
    const baseDesc = (description ?? task.description ?? "").slice(0, 2000);

    const system =
      "You are an assistant that rewrites task titles to be concise and actionable, and descriptions to be clear and helpful.";
    const prompt = `Rewrite this task to be clearer and more concise.\n\nTitle: ${baseTitle}\nDescription: ${baseDesc}\n\nReturn JSON with keys: title, description. Keep it brief.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    let parsed: { title?: string; description?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      // ignore parse error; fall back
    }

    const newTitle = (parsed.title || baseTitle).slice(0, 200);
    const newDesc = (parsed.description || baseDesc).slice(0, 2000);

    const { data: updated, error: uErr } = await supabase
      .from("tasks")
      .update({ title: newTitle, description: newDesc, updated_at: new Date().toISOString() })
      .eq("task_id", task_id)
      .select()
      .single();
    if (uErr) throw uErr;

    return new Response(JSON.stringify(updated), {
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = (e as any)?.message ?? String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
