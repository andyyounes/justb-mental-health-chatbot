import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import {
  KNOWLEDGE_BASE,
  getEmbedding,
  getPineconeIndexHost,
  createPineconeIndex,
  pineconeUpsert,
  pineconeQuery,
  checkResponseSafety,
} from "./pinecone_rag.ts";

// ============================================================
// REQUIRED SUPABASE SECRETS (Supabase Dashboard → Edge Functions → Secrets):
//   GROQ_API_KEY         — already set
//   SUPABASE_URL         — already set
//   SUPABASE_SERVICE_ROLE_KEY — already set
//   SUPABASE_ANON_KEY    — already set
//   PINECONE_API_KEY     — your Pinecone API key (pcsk_...)
//   HUGGINGFACE_API_KEY  — your HuggingFace token (hf_...)
//
// One-time Pinecone setup: POST /make-server-97cb3ddd/pinecone/init
// ============================================================

const PINECONE_INDEX_NAME = "justb-knowledge";

// ============================================================
// IP-BASED GEOLOCATION (backend, no user permission needed)
// Cloudflare sets CF-IPCountry automatically on Supabase Edge.
// ============================================================
async function getCountryFromRequest(request: Request): Promise<string> {
  const cfCountry = request.headers.get("CF-IPCountry");
  if (cfCountry && cfCountry !== "XX") return cfCountry.toUpperCase();

  const forwarded = request.headers.get("X-Forwarded-For");
  const ip = forwarded?.split(",")[0]?.trim();
  if (!ip || ip === "127.0.0.1" || ip.startsWith("::")) return "US";

  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const geo = await res.json();
      return (geo.countryCode ?? "US").toUpperCase();
    }
  } catch { /* silently fallback */ }
  return "US";
}

// ============================================================
// CRISIS NUMBERS BY COUNTRY (ISO 3166-1 alpha-2)
// ============================================================
const CRISIS_NUMBERS_BY_COUNTRY: Record<string, { crisis: string; emergency: string }> = {
  US: { crisis: "988",             emergency: "911" },
  CA: { crisis: "988",             emergency: "911" },
  MX: { crisis: "800-290-0024",    emergency: "911" },
  GB: { crisis: "116 123",         emergency: "999" },
  IE: { crisis: "116 123",         emergency: "999" },
  AU: { crisis: "+61 13 11 14",    emergency: "000" },
  NZ: { crisis: "1737",            emergency: "111" },
  AM: { crisis: "+374 80 001 800", emergency: "911" }, // Armenia
  LB: { crisis: "1564",            emergency: "140" }, // Lebanon
  IT: { crisis: "800 274 274",     emergency: "118" },
  FR: { crisis: "3114",            emergency: "15" },
  DE: { crisis: "0800 111 0 111",  emergency: "112" },
  JP: { crisis: "0120-279-338",    emergency: "119" },
  KR: { crisis: "1393",            emergency: "119" },
  CN: { crisis: "400-161-9995",    emergency: "120" },
  IN: { crisis: "9152987821",      emergency: "112" },
  ZA: { crisis: "0800 456 789",    emergency: "10111" },
  BR: { crisis: "188",             emergency: "192" },
  AR: { crisis: "135",             emergency: "911" },
  RU: { crisis: "8-800-2000-122",  emergency: "112" },
  TR: { crisis: "182",             emergency: "112" },
};

function getCrisisNumbers(countryCode: string): { crisis: string; emergency: string } {
  return (
    CRISIS_NUMBERS_BY_COUNTRY[countryCode.toUpperCase()] ??
    { crisis: "findahelpline.com", emergency: "112" }
  );
}

// ============================================================
// CASUAL MODE DETECTION (scans prior chatHistory for opt-in)
// ============================================================
function detectCasualMode(chatHistory: Array<{ role: string; content: string }>): boolean {
  const CASUAL_TRIGGERS = [
    "talk normally", "be more casual", "just talk", "stop suggesting",
    "no exercises", "no suggestions", "just chat", "casual conversation",
    "normal conversation", "don't suggest", "stop the exercises",
    "just be normal", "chill mode", "stop recommending", "no more exercises",
    "stop pushing exercises", "drop the suggestions", "less formal",
  ];
  return chatHistory.some(
    (msg) =>
      msg.role === "user" &&
      CASUAL_TRIGGERS.some((t) => msg.content.toLowerCase().includes(t)),
  );
}

// ============================================================
// RAG CONTEXT RETRIEVAL FROM PINECONE
// Gracefully skips if keys not configured or index not seeded.
// ============================================================
async function getRagContext(
  userMessage: string,
  hfApiKey: string,
  pineconeApiKey: string,
): Promise<string> {
  if (!hfApiKey || !pineconeApiKey) return "";
  try {
    const embedding = await getEmbedding(userMessage, hfApiKey);
    const host = await getPineconeIndexHost(pineconeApiKey, PINECONE_INDEX_NAME);
    const results = await pineconeQuery(embedding, 3, pineconeApiKey, host);
    const relevant = results.filter((r) => r.score > 0.4);
    if (relevant.length === 0) return "";
    return (
      "\n\n## RELEVANT KNOWLEDGE BASE CONTEXT (use this to inform your response where applicable):\n" +
      relevant.map((r, i) => `${i + 1}. ${r.text}`).join("\n\n")
    );
  } catch (err) {
    console.log("RAG retrieval skipped (non-fatal):", (err as Error).message);
    return "";
  }
}

// ============================================================
// DYNAMIC SYSTEM PROMPT
// Casual mode: same safety monitoring, but no exercise suggestions.
// ============================================================
function buildSystemPrompt(
  casualMode: boolean,
  ragContext: string,
): string {
  const coreTone = `You are JustB, a mental wellness companion. You talk like a caring, calm friend — not a therapist writing clinical notes.

## TONE RULES (NON-NEGOTIABLE)
- Keep every response to 2-3 SHORT sentences maximum. No exceptions for normal conversations.
- Never write long paragraphs or bullet points in normal conversation.
- Never start a response with "I" — it sounds robotic. Start with empathy, a reflection, or a question.
- Use lowercase, casual language. Contractions are good. Formal language is bad.
- Leave a line break between thoughts instead of cramming everything into one block.
- Good examples: "that sounds really hard. what's been going on?" / "anxiety is exhausting. have you been sleeping okay?" / "i'm here. take your time."
- Bad examples: "I understand that you're experiencing feelings of anxiety. It's important to acknowledge..." — NEVER do this.
- For crisis responses only: slightly longer is okay (3-4 short lines max), but keep the same warm, direct tone.`;

  const standardMode = `
## WHAT YOU DO
- Listen, reflect back, and ask one follow-up question at a time.
- Offer coping strategies only when asked or clearly needed — don't lecture.
- Gently mention professional help when appropriate, but don't repeat it every message.
- Suggest the app's Activities or Schedule features only if genuinely relevant.

## CASUAL MODE
If the user asks you to "talk normally", "be more casual", "stop suggesting exercises", or similar phrases, respond:
1. Acknowledge their preference warmly — e.g., "totally, let's just talk."
2. Briefly note that background safety support continues.
3. Switch to pure conversational mode — no exercise cards, no activity suggestions.`;

  const casualModeSection = `
## CASUAL CONVERSATION MODE — ACTIVE
The user has requested a casual conversation style. Follow these rules:
- Talk like a real friend, not a wellness app. No jargon, no suggestions.
- Do NOT suggest exercises, activities, breathing techniques, or coping strategies unless the user explicitly asks for them.
- Do NOT mention the Activities or Schedule sections of the app.
- Keep responses even shorter — one or two sentences max when possible.
- Ask follow-up questions and be genuinely curious.
- IMPORTANT: Background safety monitoring still continues at full strength (see below).`;

  const crisisSection = `
## CRISIS MONITORING — HIGHEST PRIORITY

Continuously monitor every message for crisis signals and respond according to the tier below. Safety always takes priority over conversation flow — this applies even in casual mode.

### TIER 1 — Passive Suicidal Ideation
Signals: "I don't want to be here anymore", "I wish I could disappear", "nobody would miss me", "life isn't worth living", "I'm tired of everything", "I feel empty", vague expressions of hopelessness or feeling like a burden.
Response protocol:
- Acknowledge their pain with deep empathy and without judgment
- Gently but clearly recommend speaking to a mental health professional
- Provide this helpline finder: "You can find a helpline in your country at **findahelpline.com** — they list local crisis lines worldwide."
- Also mention the International Association for Suicide Prevention directory: https://www.iasp.info/resources/Crisis_Centres/
- Encourage them to stay with you and keep talking

### TIER 2 — Active Suicidal Ideation
Signals: "I want to kill myself", "I want to die", "I'm thinking about suicide", "I have a plan to end my life", "I want to end my life", "I'm planning to end it", "better off dead", "no reason to live", explicit statements of intent without confirmed immediate action.
Response protocol:
- Respond with urgency and warmth — do NOT minimize or redirect away from the topic
- Prominently display the local crisis hotline. If you can detect the user's country or region from context, provide the specific local number. Default to:
  - 🇺🇸 USA: **988** (Suicide & Crisis Lifeline — call or text)
  - 🇬🇧 UK: **116 123** (Samaritans)
  - 🇦🇺 AU: **+61 13 11 14** (Lifeline)
  - 🇨🇦 CA: **1-833-456-4566**
  - 🇦🇲 Armenia: **+374 80 001 800** (crisis) + **911** (emergency)
  - 🇱🇧 Lebanon: **1564** (Embrace NGO) + **140** (emergency)
  - 🇮🇹 Italy: **800 274 274** + **118** (emergency)
  - 🇫🇷 France: **3114** (national crisis line) + **15** (emergency)
  - 🌍 International: **findahelpline.com**
- Ask them directly if they are safe right now
- Encourage them to call or text the helpline immediately
- Offer to stay with them while they reach out

### TIER 3 — Imminent Danger / Active Crisis
Signals: "I'm standing on a bridge", "I have the pills in my hand", "I'm about to do it", "I've already taken something", "I'm committing suicide", "I want to commit suicide", "goodbye forever", "this is my last message", any description of being in the act of self-harm or about to act imminently.
Response protocol:
- Your VERY FIRST line must ALWAYS be:
🚨 EMERGENCY — YOU ARE NOT ALONE. HELP IS ONE CALL AWAY.
- Tell the user: "I'm detecting your location to connect you with the right emergency services. A call button will appear — all you need to do is press it."
- Do NOT list countries or numbers in the chat. The button will handle it automatically.
- Stay warm, calm, and keep them talking.
- Do NOT change the subject under any circumstances.`;

  const modeSection = casualMode ? casualModeSection : standardMode;

  return coreTone + modeSection + crisisSection + ragContext;
}

// ============================================================
// SUPABASE CLIENTS
// ============================================================
const getSupabaseAdmin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

const getSupabaseClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

// ============================================================
// HONO APP
// ============================================================
const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("*", logger(console.log));

// Health check
app.get("/make-server-97cb3ddd/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasServiceRole: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      hasAnonKey: !!Deno.env.get("SUPABASE_ANON_KEY"),
      hasPinecone: !!Deno.env.get("PINECONE_API_KEY"),
      hasHuggingFace: !!Deno.env.get("HUGGINGFACE_API_KEY"),
    },
  }),
);

// ========== AUTHENTICATION ROUTES ==========

app.post("/make-server-97cb3ddd/signup", async (c) => {
  try {
    const { username, password, displayName } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }
    const existingUser = await kv.get(`user:username:${username}`);
    if (existingUser) {
      return c.json({ error: "Username already exists" }, 400);
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${username}@mindfulchat.local`,
      password: password,
      user_metadata: { username, displayName: displayName || username },
      email_confirm: true,
    });
    if (error) {
      console.log("Error creating user during signup:", error);
      return c.json({ error: error.message }, 400);
    }
    await kv.set(`user:username:${username}`, data.user.id);
    await kv.set(`user:${data.user.id}:profile`, {
      username,
      displayName: displayName || username,
      createdAt: new Date().toISOString(),
    });
    return c.json({
      success: true,
      userId: data.user.id,
      username,
      displayName: displayName || username,
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

app.post("/make-server-97cb3ddd/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@mindfulchat.local`,
      password,
    });
    if (error) {
      console.log("Login error:", error);
      return c.json({ error: "Invalid username or password" }, 401);
    }
    const profile = await kv.get(`user:${data.user.id}:profile`);
    return c.json({
      success: true,
      accessToken: data.session.access_token,
      userId: data.user.id,
      username: profile?.username || username,
      displayName: profile?.displayName || username,
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

app.get("/make-server-97cb3ddd/session", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: "Invalid session" }, 401);
    const profile = await kv.get(`user:${user.id}:profile`);
    return c.json({
      success: true,
      userId: user.id,
      username: profile?.username || user.user_metadata?.username,
      displayName: profile?.displayName || user.user_metadata?.displayName,
    });
  } catch (error) {
    console.log("Session validation error:", error);
    return c.json({ error: "Session validation failed" }, 500);
  }
});

app.post("/make-server-97cb3ddd/logout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Logout error:", error);
      return c.json({ error: "Logout failed" }, 500);
    }
    return c.json({ success: true });
  } catch (error) {
    console.log("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

// ========== GROQ LLM CHAT ROUTE ==========

app.post("/make-server-97cb3ddd/chat", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log("Authorization error during chat:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { message, chatHistory } = await c.req.json();
    if (!message) return c.json({ error: "Message is required" }, 400);

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return c.json({
        error: "GROQ_API_KEY is missing. Please add it to your Supabase project secrets.",
        details: "Go to Supabase Dashboard → Edge Functions → Secrets and add GROQ_API_KEY.",
      }, 500);
    }

    const hfApiKey    = Deno.env.get("HUGGINGFACE_API_KEY") ?? "";
    const pineconeKey = Deno.env.get("PINECONE_API_KEY")    ?? "";

    // ── 1. Backend IP geolocation ──────────────────────────────────────
    const countryCode = await getCountryFromRequest(c.req.raw);
    const crisisNums  = getCrisisNumbers(countryCode);

    // ── 2. Detect casual mode from chat history ────────────────────────
    const casualMode = detectCasualMode(chatHistory || []);

    // ── 3. Retrieve RAG context from Pinecone (graceful fallback) ──────
    const ragContext = await getRagContext(message, hfApiKey, pineconeKey);

    // ── 4. Build dynamic system prompt ────────────────────────────────
    const systemPrompt = buildSystemPrompt(casualMode, ragContext);

    const chatMessages = [
      ...(chatHistory || []).slice(-10),
      { role: "user", content: message },
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.log("Groq API error:", errorText);
      return c.json({
        error: "Failed to get response from Groq",
        details: `Groq API returned ${groqResponse.status}: ${errorText}`,
        debugInfo: { status: groqResponse.status, hasApiKey: !!groqApiKey },
      }, 500);
    }

    const groqData = await groqResponse.json();
    let botResponse =
      groqData.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // ── 5. DistilBERT safety check ─────────────────────────────────────
    if (hfApiKey) {
      const safety = await checkResponseSafety(botResponse, hfApiKey);
      if (!safety.safe) {
        console.log("Safety filter triggered:", safety.reason);
        botResponse =
          "hey, just making sure i'm being helpful here.\n\n" +
          "can you tell me a bit more about what's going on? i'm listening.";
      }
    }

    // ========== CRISIS TIER DETECTION ==========
    const actions: any[] = [];
    const lowerMessage  = message.toLowerCase();
    const lowerResponse = botResponse.toLowerCase();

    // TIER 3 — Imminent danger (FIRST, highest priority)
    const isTier3 =
      lowerMessage.includes("standing on a bridge") ||
      lowerMessage.includes("jumping off") ||
      lowerMessage.includes("about to do it") ||
      lowerMessage.includes("about to end it") ||
      lowerMessage.includes("going to kill myself") ||
      lowerMessage.includes("going to do it") ||
      lowerMessage.includes("commit suicide") ||
      lowerMessage.includes("committing suicide") ||
      lowerMessage.includes("pills in my hand") ||
      lowerMessage.includes("already took") ||
      lowerMessage.includes("already taken") ||
      lowerMessage.includes("jumped") ||
      lowerMessage.includes("knife to my") ||
      lowerMessage.includes("gun to my") ||
      lowerMessage.includes("ending it tonight") ||
      lowerMessage.includes("ending it now") ||
      lowerMessage.includes("last message") ||
      lowerMessage.includes("goodbye forever") ||
      lowerMessage.includes("no one will find me");

    // TIER 2 — Active suicidal ideation
    const isTier2 =
      lowerMessage.includes("suicidal") ||
      lowerMessage.includes("suicide") ||
      lowerMessage.includes("kill myself") ||
      lowerMessage.includes("end it all") ||
      lowerMessage.includes("want to die") ||
      lowerMessage.includes("end my life") ||
      lowerMessage.includes("take my life") ||
      lowerMessage.includes("better off dead") ||
      lowerMessage.includes("no reason to live") ||
      lowerMessage.includes("planning to end") ||
      lowerMessage.includes("don't want to live");

    // TIER 1 — Passive ideation / hopelessness
    const isTier1 =
      lowerMessage.includes("don't want to be here") ||
      lowerMessage.includes("wish i could disappear") ||
      lowerMessage.includes("nobody would miss me") ||
      lowerMessage.includes("life isn't worth") ||
      lowerMessage.includes("tired of everything") ||
      lowerMessage.includes("feel empty") ||
      lowerMessage.includes("feeling empty") ||
      lowerMessage.includes("burden to everyone") ||
      lowerMessage.includes("everyone would be better without me") ||
      lowerMessage.includes("what's the point");

    // ── Crisis action cards (always shown regardless of casual mode) ──
    if (isTier3) {
      actions.push({
        id: "emergency-call",
        type: "emergency",
        title: "🚨 Call Emergency Services NOW",
        description: `${crisisNums.emergency} (Emergency) · ${crisisNums.crisis} (Crisis Line)`,
        duration: "Call immediately",
      });
    } else if (isTier2) {
      actions.push({
        id: "crisis-hotline",
        type: "emergency",
        title: "📞 Crisis Support Line",
        description: `${crisisNums.crisis} · USA: 988 · UK: 116 123 · AU: +61 13 11 14 · AM: +374 80 001 800 · International: findahelpline.com`,
        duration: "Available 24/7",
      });
    } else if (isTier1) {
      actions.push({
        id: "findahelpline",
        type: "exercise",
        title: "🌍 Find Local Support",
        description: "Visit findahelpline.com to find a free helpline in your country",
        duration: "Free & confidential",
      });
    } else if (!casualMode) {
      // ── Exercise/task cards — suppressed in casual mode ──────────────
      if (
        lowerMessage.includes("anxious") ||
        lowerMessage.includes("anxiety") ||
        lowerMessage.includes("panic") ||
        lowerMessage.includes("worried") ||
        lowerResponse.includes("anxiety")
      ) {
        const anxietyExercises = [
          { id: "478-breathing", type: "exercise", title: "4-7-8 Breathing Technique", description: "A calming breath pattern: inhale for 4, hold for 7, exhale for 8", duration: "3 minutes" },
          { id: "box-breathing", type: "exercise", title: "Box Breathing Exercise", description: "A 4-4-4-4 breathing technique to help calm anxiety and reduce stress", duration: "3-5 minutes" },
          { id: "grounding", type: "exercise", title: "5-4-3-2-1 Grounding Technique", description: "Connect with your senses to reduce anxiety and stay present", duration: "5 minutes" },
          { id: "visualization", type: "exercise", title: "Safe Place Visualization", description: "Imagine a peaceful, safe place to calm your nervous system", duration: "5-7 minutes" },
        ];
        const shuffled = anxietyExercises.sort(() => 0.5 - Math.random());
        actions.push(shuffled[0], shuffled[1]);
      } else if (
        lowerMessage.includes("stress") ||
        lowerMessage.includes("overwhelm") ||
        lowerMessage.includes("tense") ||
        lowerResponse.includes("stress")
      ) {
        const stressExercises = [
          { id: "pmr", type: "exercise", title: "Progressive Muscle Relaxation", description: "Release physical tension through systematic muscle relaxation", duration: "10 minutes" },
          { id: "body-scan", type: "exercise", title: "Body Scan Meditation", description: "Notice and release tension held in different parts of your body", duration: "7-10 minutes" },
          { id: "mindful-walk", type: "exercise", title: "Mindful Walking", description: "Take a short walk while focusing on your senses and movement", duration: "10 minutes" },
        ];
        actions.push(stressExercises.sort(() => 0.5 - Math.random())[0]);
      } else if (
        lowerMessage.includes("sleep") ||
        lowerMessage.includes("insomnia") ||
        lowerMessage.includes("tired") ||
        lowerMessage.includes("rest")
      ) {
        actions.push(
          { id: "sleep-breathing", type: "exercise", title: "4-7-8 Sleep Breathing", description: "A breathing technique specifically designed to help you fall asleep", duration: "5 minutes" },
          { id: "sleep-task", type: "task", title: "Establish Sleep Routine", description: "Set a consistent bedtime and create a relaxing pre-sleep routine", time: "9:00 PM" },
        );
      } else if (
        lowerMessage.includes("angry") ||
        lowerMessage.includes("anger") ||
        lowerMessage.includes("irritated") ||
        lowerMessage.includes("frustrated")
      ) {
        actions.push(
          { id: "cooling-breath", type: "exercise", title: "Cooling Breath Technique", description: "A breathing exercise to calm anger and cool down emotionally", duration: "3-5 minutes" },
          { id: "physical-release", type: "exercise", title: "Physical Tension Release", description: "Safe physical movements to release pent-up anger energy", duration: "5 minutes" },
        );
      }

      if (
        lowerMessage.includes("schedule") ||
        lowerMessage.includes("routine") ||
        lowerMessage.includes("habit") ||
        lowerMessage.includes("plan") ||
        lowerResponse.includes("schedule") ||
        lowerResponse.includes("routine")
      ) {
        actions.push(
          { id: "morning-task", type: "task", title: "Morning Mindfulness", description: "Start your day with 5 minutes of meditation or journaling", time: "7:30 AM" },
          { id: "exercise-task", type: "task", title: "Daily Movement", description: "Schedule 20 minutes of physical activity", time: "5:00 PM" },
        );
      }

      if (
        lowerMessage.includes("sad") ||
        lowerMessage.includes("depressed") ||
        lowerMessage.includes("down") ||
        lowerMessage.includes("hopeless") ||
        lowerMessage.includes("mood")
      ) {
        actions.push(
          { id: "gratitude", type: "exercise", title: "Gratitude Journaling", description: "Write down three things you're grateful for today", duration: "5 minutes" },
          { id: "self-compassion", type: "exercise", title: "Self-Compassion Exercise", description: "Practice speaking to yourself with kindness and understanding", duration: "5 minutes" },
        );
      }

      if (
        lowerMessage.includes("exhausted") ||
        lowerMessage.includes("no energy") ||
        lowerMessage.includes("unmotivated")
      ) {
        actions.push(
          { id: "energizing-breath", type: "exercise", title: "Energizing Breath Work", description: "Quick breathing exercises to boost energy and alertness", duration: "3 minutes" },
          { id: "gentle-movement", type: "exercise", title: "Gentle Movement Stretch", description: "Simple stretches to wake up your body and mind", duration: "5 minutes" },
        );
      }
    }

    return c.json({
      success: true,
      response: botResponse,
      actions: actions.length > 0 ? actions : undefined,
      crisisLevel: isTier3 ? 3 : isTier2 ? 2 : isTier1 ? 1 : 0,
      userId: user.id,
      casualMode,
    });
  } catch (error) {
    console.log("Chat error:", error);
    return c.json({ error: "Chat processing failed" }, 500);
  }
});

// ========== PINECONE INIT (one-time knowledge base seeding) ==========

app.post("/make-server-97cb3ddd/pinecone/init", async (c) => {
  try {
    const pineconeApiKey = Deno.env.get("PINECONE_API_KEY");
    const hfApiKey       = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!pineconeApiKey) return c.json({ error: "PINECONE_API_KEY not set in Supabase secrets" }, 500);
    if (!hfApiKey)       return c.json({ error: "HUGGINGFACE_API_KEY not set in Supabase secrets" }, 500);

    await createPineconeIndex(pineconeApiKey, PINECONE_INDEX_NAME);
    const host = await getPineconeIndexHost(pineconeApiKey, PINECONE_INDEX_NAME);

    const vectors: Array<{ id: string; values: number[]; metadata: { text: string } }> = [];
    for (const doc of KNOWLEDGE_BASE) {
      const values = await getEmbedding(doc.text, hfApiKey);
      vectors.push({ id: doc.id, values, metadata: { text: doc.text } });
    }

    await pineconeUpsert(vectors, pineconeApiKey, host);

    return c.json({
      success: true,
      message: `Seeded ${vectors.length} vectors into '${PINECONE_INDEX_NAME}'`,
      indexHost: host,
    });
  } catch (error) {
    console.log("Pinecone init error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== PINECONE STATUS ==========

app.get("/make-server-97cb3ddd/pinecone/status", async (c) => {
  try {
    const pineconeApiKey = Deno.env.get("PINECONE_API_KEY");
    if (!pineconeApiKey) return c.json({ ready: false, reason: "PINECONE_API_KEY not set" });
    const host = await getPineconeIndexHost(pineconeApiKey, PINECONE_INDEX_NAME);
    return c.json({ ready: true, host, indexName: PINECONE_INDEX_NAME });
  } catch (err) {
    return c.json({ ready: false, reason: String(err) });
  }
});

// ========== CHAT HISTORY ROUTES ==========

app.post("/make-server-97cb3ddd/chat/sessions/new", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const session = {
      id: sessionId,
      title: `Chat · ${dateLabel}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      messageCount: 0,
      lastMessage: "",
    };
    await kv.set(`user:${user.id}:session:${sessionId}`, session);
    const sessionsKey = `user:${user.id}:sessions`;
    const sessions = (await kv.get(sessionsKey)) || [];
    sessions.push(sessionId);
    await kv.set(sessionsKey, sessions);
    return c.json({ success: true, session });
  } catch (error) {
    console.log("Session creation error:", error);
    return c.json({ error: "Failed to create session" }, 500);
  }
});

app.get("/make-server-97cb3ddd/chat/sessions", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionsKey = `user:${user.id}:sessions`;
    const sessionIds = (await kv.get(sessionsKey)) || [];
    const sessions = [];
    for (const sessionId of sessionIds) {
      const session = await kv.get(`user:${user.id}:session:${sessionId}`);
      if (session) sessions.push(session);
    }
    sessions.sort((a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return c.json({ success: true, sessions });
  } catch (error) {
    console.log("Sessions retrieval error:", error);
    return c.json({ error: "Failed to retrieve sessions" }, 500);
  }
});

app.post("/make-server-97cb3ddd/chat/save", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const { sessionId, message, isBot, timestamp } = await c.req.json();
    if (!sessionId || !message || isBot === undefined || !timestamp) {
      return c.json({ error: "SessionId, message, isBot, and timestamp are required" }, 400);
    }

    const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
    const existingMessages = (await kv.get(messagesKey)) || [];
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message, isBot, timestamp,
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...existingMessages, newMessage];
    await kv.set(messagesKey, updatedMessages);

    const session = await kv.get(`user:${user.id}:session:${sessionId}`);
    if (session) {
      session.messageCount = updatedMessages.length;
      session.lastMessage  = ""; // privacy — never store content
      session.updatedAt    = new Date().toISOString();

      // AI-generated title on first user message
      if (!isBot && existingMessages.length === 0) {
        try {
          const groqApiKey = Deno.env.get("GROQ_API_KEY");
          if (groqApiKey) {
            const titleRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: "You name mental wellness chat sessions. Given the user's first message, reply with ONLY a short 2-4 word title (no quotes, no punctuation at the end) that captures the emotional topic — e.g. 'work stress spiral', 'trouble sleeping', 'feeling lonely', 'relationship worries'. Never repeat the user's exact words. Never mention names." },
                  { role: "user", content: message },
                ],
                max_tokens: 20,
                temperature: 0.6,
              }),
            });
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              const suggestedTitle = titleData.choices?.[0]?.message?.content?.trim();
              if (suggestedTitle && suggestedTitle.length > 0 && suggestedTitle.length < 60) {
                session.title = suggestedTitle;
              }
            }
          }
        } catch (titleErr) {
          console.log("Title generation error (non-fatal):", titleErr);
        }
      }
      await kv.set(`user:${user.id}:session:${sessionId}`, session);
    }
    return c.json({ success: true, messageId: newMessage.id });
  } catch (error) {
    console.log("Chat save error:", error);
    return c.json({ error: "Failed to save chat message" }, 500);
  }
});

app.post("/make-server-97cb3ddd/chat/sessions/:sessionId/messages/clear", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionId   = c.req.param("sessionId");
    const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
    await kv.set(messagesKey, []);
    const session = await kv.get(`user:${user.id}:session:${sessionId}`);
    if (session) {
      session.messageCount = 0;
      session.lastMessage  = "";
      session.updatedAt    = new Date().toISOString();
      await kv.set(`user:${user.id}:session:${sessionId}`, session);
    }
    return c.json({ success: true, sessionId });
  } catch (error) {
    console.log("Clear history error:", error);
    return c.json({ error: "Failed to clear session messages" }, 500);
  }
});

app.get("/make-server-97cb3ddd/chat/sessions/:sessionId/messages", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionId   = c.req.param("sessionId");
    const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
    const messages    = (await kv.get(messagesKey)) || [];
    return c.json({ success: true, messages });
  } catch (error) {
    console.log("Chat history retrieval error:", error);
    return c.json({ error: "Failed to retrieve chat history" }, 500);
  }
});

app.get("/make-server-97cb3ddd/chat/history", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const history = (await kv.get(`user:${user.id}:chat_history`)) || [];
    return c.json({ success: true, history });
  } catch (error) {
    console.log("Chat history retrieval error:", error);
    return c.json({ error: "Failed to retrieve chat history" }, 500);
  }
});

// ========== DELETE SESSION ==========
app.delete("/make-server-97cb3ddd/chat/sessions/:sessionId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionId = c.req.param("sessionId");
    await kv.del(`user:${user.id}:session:${sessionId}`);
    await kv.del(`user:${user.id}:session:${sessionId}:messages`);
    const sessionsKey = `user:${user.id}:sessions`;
    const sessions: string[] = (await kv.get(sessionsKey)) || [];
    await kv.set(sessionsKey, sessions.filter((id: string) => id !== sessionId));
    return c.json({ success: true });
  } catch (error) {
    console.log("Session delete error:", error);
    return c.json({ error: "Failed to delete session" }, 500);
  }
});

// ========== RENAME SESSION ==========
app.patch("/make-server-97cb3ddd/chat/sessions/:sessionId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "No access token provided" }, 401);
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const sessionId = c.req.param("sessionId");
    const { title }  = await c.req.json();
    if (!title || typeof title !== "string") return c.json({ error: "Title is required" }, 400);

    const sessionKey = `user:${user.id}:session:${sessionId}`;
    const session    = await kv.get(sessionKey);
    if (!session) return c.json({ error: "Session not found" }, 404);
    session.title    = title.trim().slice(0, 60);
    session.updatedAt = new Date().toISOString();
    await kv.set(sessionKey, session);
    return c.json({ success: true, title: session.title });
  } catch (error) {
    console.log("Session rename error:", error);
    return c.json({ error: "Failed to rename session" }, 500);
  }
});

Deno.serve(app.fetch);
