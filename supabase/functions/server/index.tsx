import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware - CORS with explicit configuration
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("*", logger(console.log));

// Health check endpoint
app.get("/make-server-97cb3ddd/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasServiceRole: !!Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      ),
      hasAnonKey: !!Deno.env.get("SUPABASE_ANON_KEY"),
    },
  });
});

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
};

// ========== AUTHENTICATION ROUTES ==========

app.post("/make-server-97cb3ddd/signup", async (c) => {
  try {
    const { username, password, displayName } =
      await c.req.json();
    if (!username || !password) {
      return c.json(
        { error: "Username and password are required" },
        400,
      );
    }
    const existingUser = await kv.get(
      `user:username:${username}`,
    );
    if (existingUser) {
      return c.json({ error: "Username already exists" }, 400);
    }
    const supabase = getSupabaseAdmin();
    const { data, error } =
      await supabase.auth.admin.createUser({
        email: `${username}@mindfulchat.local`,
        password: password,
        user_metadata: {
          username: username,
          displayName: displayName || username,
        },
        email_confirm: true,
      });
    if (error) {
      console.log("Error creating user during signup:", error);
      return c.json({ error: error.message }, 400);
    }
    await kv.set(`user:username:${username}`, data.user.id);
    await kv.set(`user:${data.user.id}:profile`, {
      username: username,
      displayName: displayName || username,
      createdAt: new Date().toISOString(),
    });
    return c.json({
      success: true,
      userId: data.user.id,
      username: username,
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
      return c.json(
        { error: "Username and password are required" },
        400,
      );
    }
    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: `${username}@mindfulchat.local`,
        password: password,
      });
    if (error) {
      console.log("Login error:", error);
      return c.json(
        { error: "Invalid username or password" },
        401,
      );
    }
    const profile = await kv.get(
      `user:${data.user.id}:profile`,
    );
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
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Invalid session" }, 401);
    }
    const profile = await kv.get(`user:${user.id}:profile`);
    return c.json({
      success: true,
      userId: user.id,
      username:
        profile?.username || user.user_metadata?.username,
      displayName:
        profile?.displayName || user.user_metadata?.displayName,
    });
  } catch (error) {
    console.log("Session validation error:", error);
    return c.json({ error: "Session validation failed" }, 500);
  }
});

app.post("/make-server-97cb3ddd/logout", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
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
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log(
        "Authorization error during chat:",
        authError,
      );
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { message, chatHistory } = await c.req.json();
    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.log("GROQ_API_KEY is not set in Supabase secrets.");
      return c.json(
        {
          error: "GROQ_API_KEY is missing. Please add it to your Supabase project secrets.",
          details: "Go to Supabase Dashboard → Edge Functions → Secrets and add GROQ_API_KEY.",
        },
        500,
      );
    }

    const systemPrompt = `You are JustB, a mental wellness companion. You talk like a caring, calm friend — not a therapist writing clinical notes.

## TONE RULES (NON-NEGOTIABLE)
- Keep every response to 2-3 SHORT sentences maximum. No exceptions for normal conversations.
- Never write long paragraphs or bullet points in normal conversation.
- Never start a response with "I" — it sounds robotic. Start with empathy, a reflection, or a question.
- Use lowercase, casual language. Contractions are good. Formal language is bad.
- Leave a line break between thoughts instead of cramming everything into one block.
- Good examples: "that sounds really hard. what's been going on?" / "anxiety is exhausting. have you been sleeping okay?" / "i'm here. take your time."
- Bad examples: "I understand that you're experiencing feelings of anxiety. It's important to acknowledge..." — NEVER do this.
- For crisis responses only: slightly longer is okay (3-4 short lines max), but keep the same warm, direct tone.

## WHAT YOU DO
- Listen, reflect back, and ask one follow-up question at a time.
- Offer coping strategies only when asked or clearly needed — don't lecture.
- Gently mention professional help when appropriate, but don't repeat it every message.
- Suggest the app's Activities or Schedule features only if genuinely relevant.

## CRISIS MONITORING — HIGHEST PRIORITY

Continuously monitor every message for crisis signals and respond according to the tier below. Safety always takes priority over conversation flow.

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
  - 🇦🇺 AU: **13 11 14** (Lifeline)
  - 🇨🇦 CA: **1-833-456-4566**
  - 🇦🇲 Armenia: **113** (emergency) + **8-000-1-800** (mental health)
  - 🇱🇧 Lebanon: **1564** (Embrace NGO) + **140** (emergency)
  - 🇮🇹 Italy: **800 274 274** + **118** (emergency)
  - 🇫🇷 France: **3114** (national crisis line) + **15** (emergency)
  - 🌍 International: **findahelpline.com**
- Ask them directly if they are safe right now
- Encourage them to call or text the helpline immediately
- Offer to stay with them while they reach out

### TIER 3 — Imminent Danger / Active Crisis
Signals: "I'm standing on a bridge", "I have the pills in my hand", "I'm about to do it", "I've already taken something", "I'm committing suicide", "goodbye forever", "this is my last message", any description of being in the act of self-harm or about to act imminently.
Response protocol:
- Your VERY FIRST line must ALWAYS be:
🚨 EMERGENCY — YOU ARE NOT ALONE. HELP IS ONE CALL AWAY.
- Tell the user: "I'm detecting your location to connect you with the right emergency services. A call button will appear — all you need to do is press it."
- Do NOT list countries or numbers in the chat. The button will handle it automatically.
- Stay warm, calm, and keep them talking.
- Do NOT change the subject under any circumstances.`;

    const chatMessages = [
      ...(chatHistory || []).slice(-10),
      { role: "user", content: message },
    ];

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.log("Groq API error:", errorText);
      return c.json(
        {
          error: "Failed to get response from Groq",
          details: `Groq API returned ${groqResponse.status}: ${errorText}`,
          debugInfo: { status: groqResponse.status, hasApiKey: !!groqApiKey },
        },
        500,
      );
    }

    const groqData = await groqResponse.json();
    const botResponse =
      groqData.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // ========== CRISIS TIER DETECTION ==========
    const actions = [];
    const lowerMessage = message.toLowerCase();
    const lowerResponse = botResponse.toLowerCase();

    // TIER 3 — Imminent danger (checked FIRST, highest priority)
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
      lowerMessage.includes(
        "everyone would be better without me",
      ) ||
      lowerMessage.includes("what's the point");

    // ========== ACTION CARDS BASED ON TIER ==========

    if (isTier3) {
      // Tier 3 — ONE card only: emergency services (911/999/000)
      actions.push({
        id: "emergency-call",
        type: "emergency",
        title: "🚨 Call Emergency Services NOW",
        description:
          "USA/Canada: 911 | UK: 999 | Australia: 000 | Europe: 112 | Most countries: 112",
        duration: "Call immediately",
      });
    } else if (isTier2) {
      // Tier 2 — ONE card only: crisis support line (988/116 123/13 11 14)
      actions.push({
        id: "crisis-hotline",
        type: "emergency",
        title: "📞 Crisis Support Line",
        description:
          "USA: 988 | UK: 116 123 | Australia: 13 11 14 | Armenia: 8-000-1-800 | International: findahelpline.com",
        duration: "Available 24/7",
      });
    } else if (isTier1) {
      // Tier 1 — ONE card only: findahelpline link (no call button needed)
      actions.push({
        id: "findahelpline",
        type: "exercise",
        title: "🌍 Find Local Support",
        description:
          "Visit findahelpline.com to find a free helpline in your country",
        duration: "Free & confidential",
      });
    } else if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("anxiety") ||
      lowerMessage.includes("panic") ||
      lowerMessage.includes("worried") ||
      lowerResponse.includes("anxiety")
    ) {
      const anxietyExercises = [
        {
          id: "478-breathing",
          type: "exercise",
          title: "4-7-8 Breathing Technique",
          description:
            "A calming breath pattern: inhale for 4, hold for 7, exhale for 8",
          duration: "3 minutes",
        },
        {
          id: "box-breathing",
          type: "exercise",
          title: "Box Breathing Exercise",
          description:
            "A 4-4-4-4 breathing technique to help calm anxiety and reduce stress",
          duration: "3-5 minutes",
        },
        {
          id: "grounding",
          type: "exercise",
          title: "5-4-3-2-1 Grounding Technique",
          description:
            "Connect with your senses to reduce anxiety and stay present",
          duration: "5 minutes",
        },
        {
          id: "visualization",
          type: "exercise",
          title: "Safe Place Visualization",
          description:
            "Imagine a peaceful, safe place to calm your nervous system",
          duration: "5-7 minutes",
        },
      ];
      const shuffled = anxietyExercises.sort(
        () => 0.5 - Math.random(),
      );
      actions.push(shuffled[0], shuffled[1]);
    } else if (
      lowerMessage.includes("stress") ||
      lowerMessage.includes("overwhelm") ||
      lowerMessage.includes("tense") ||
      lowerResponse.includes("stress")
    ) {
      const stressExercises = [
        {
          id: "pmr",
          type: "exercise",
          title: "Progressive Muscle Relaxation",
          description:
            "Release physical tension through systematic muscle relaxation",
          duration: "10 minutes",
        },
        {
          id: "body-scan",
          type: "exercise",
          title: "Body Scan Meditation",
          description:
            "Notice and release tension held in different parts of your body",
          duration: "7-10 minutes",
        },
        {
          id: "mindful-walk",
          type: "exercise",
          title: "Mindful Walking",
          description:
            "Take a short walk while focusing on your senses and movement",
          duration: "10 minutes",
        },
      ];
      const shuffled = stressExercises.sort(
        () => 0.5 - Math.random(),
      );
      actions.push(shuffled[0]);
    } else if (
      lowerMessage.includes("sleep") ||
      lowerMessage.includes("insomnia") ||
      lowerMessage.includes("tired") ||
      lowerMessage.includes("rest")
    ) {
      actions.push({
        id: "sleep-breathing",
        type: "exercise",
        title: "4-7-8 Sleep Breathing",
        description:
          "A breathing technique specifically designed to help you fall asleep",
        duration: "5 minutes",
      });
      actions.push({
        id: "sleep-task",
        type: "task",
        title: "Establish Sleep Routine",
        description:
          "Set a consistent bedtime and create a relaxing pre-sleep routine",
        time: "9:00 PM",
      });
    } else if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("anger") ||
      lowerMessage.includes("irritated") ||
      lowerMessage.includes("frustrated")
    ) {
      actions.push({
        id: "cooling-breath",
        type: "exercise",
        title: "Cooling Breath Technique",
        description:
          "A breathing exercise to calm anger and cool down emotionally",
        duration: "3-5 minutes",
      });
      actions.push({
        id: "physical-release",
        type: "exercise",
        title: "Physical Tension Release",
        description:
          "Safe physical movements to release pent-up anger energy",
        duration: "5 minutes",
      });
    }

    // Schedule/habit keywords (only shown outside all crisis tiers)
    if (
      !isTier3 &&
      !isTier2 &&
      !isTier1 &&
      (lowerMessage.includes("schedule") ||
        lowerMessage.includes("routine") ||
        lowerMessage.includes("habit") ||
        lowerMessage.includes("plan") ||
        lowerResponse.includes("schedule") ||
        lowerResponse.includes("routine"))
    ) {
      actions.push({
        id: "morning-task",
        type: "task",
        title: "Morning Mindfulness",
        description:
          "Start your day with 5 minutes of meditation or journaling",
        time: "7:30 AM",
      });
      actions.push({
        id: "exercise-task",
        type: "task",
        title: "Daily Movement",
        description: "Schedule 20 minutes of physical activity",
        time: "5:00 PM",
      });
    }

    // Mood/depression keywords (only shown outside all crisis tiers)
    if (
      !isTier3 &&
      !isTier2 &&
      !isTier1 &&
      (lowerMessage.includes("sad") ||
        lowerMessage.includes("depressed") ||
        lowerMessage.includes("down") ||
        lowerMessage.includes("hopeless") ||
        lowerMessage.includes("mood"))
    ) {
      actions.push({
        id: "gratitude",
        type: "exercise",
        title: "Gratitude Journaling",
        description:
          "Write down three things you're grateful for today",
        duration: "5 minutes",
      });
      actions.push({
        id: "self-compassion",
        type: "exercise",
        title: "Self-Compassion Exercise",
        description:
          "Practice speaking to yourself with kindness and understanding",
        duration: "5 minutes",
      });
    }

    // Energy/motivation keywords (only shown outside all crisis tiers)
    if (
      !isTier3 &&
      !isTier2 &&
      !isTier1 &&
      (lowerMessage.includes("exhausted") ||
        lowerMessage.includes("no energy") ||
        lowerMessage.includes("unmotivated"))
    ) {
      actions.push({
        id: "energizing-breath",
        type: "exercise",
        title: "Energizing Breath Work",
        description:
          "Quick breathing exercises to boost energy and alertness",
        duration: "3 minutes",
      });
      actions.push({
        id: "gentle-movement",
        type: "exercise",
        title: "Gentle Movement Stretch",
        description:
          "Simple stretches to wake up your body and mind",
        duration: "5 minutes",
      });
    }

    return c.json({
      success: true,
      response: botResponse,
      actions: actions.length > 0 ? actions : undefined,
      crisisLevel: isTier3 ? 3 : isTier2 ? 2 : isTier1 ? 1 : 0,
      userId: user.id,
    });
  } catch (error) {
    console.log("Chat error:", error);
    return c.json({ error: "Chat processing failed" }, 500);
  }
});

// ========== CHAT HISTORY ROUTES ==========

app.post(
  "/make-server-97cb3ddd/chat/sessions/new",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "No access token provided" },
          401,
        );
      }
      const supabase = getSupabaseAdmin();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
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
      await kv.set(
        `user:${user.id}:session:${sessionId}`,
        session,
      );
      const sessionsKey = `user:${user.id}:sessions`;
      const sessions = (await kv.get(sessionsKey)) || [];
      sessions.push(sessionId);
      await kv.set(sessionsKey, sessions);
      return c.json({ success: true, session });
    } catch (error) {
      console.log("Session creation error:", error);
      return c.json({ error: "Failed to create session" }, 500);
    }
  },
);

app.get("/make-server-97cb3ddd/chat/sessions", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const sessionsKey = `user:${user.id}:sessions`;
    const sessionIds = (await kv.get(sessionsKey)) || [];
    const sessions = [];
    for (const sessionId of sessionIds) {
      const session = await kv.get(
        `user:${user.id}:session:${sessionId}`,
      );
      if (session) sessions.push(session);
    }
    sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    );
    return c.json({ success: true, sessions });
  } catch (error) {
    console.log("Sessions retrieval error:", error);
    return c.json(
      { error: "Failed to retrieve sessions" },
      500,
    );
  }
});

app.post("/make-server-97cb3ddd/chat/save", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { sessionId, message, isBot, timestamp } =
      await c.req.json();
    if (
      !sessionId ||
      !message ||
      isBot === undefined ||
      !timestamp
    ) {
      return c.json(
        {
          error:
            "SessionId, message, isBot, and timestamp are required",
        },
        400,
      );
    }
    const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
    const existingMessages = (await kv.get(messagesKey)) || [];
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message,
      isBot,
      timestamp,
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...existingMessages, newMessage];
    await kv.set(messagesKey, updatedMessages);
    const session = await kv.get(
      `user:${user.id}:session:${sessionId}`,
    );
    if (session) {
      session.messageCount = updatedMessages.length;
      session.lastMessage = "";  // never store message content — privacy/safety
      session.updatedAt = new Date().toISOString();

      // Generate a topic-based title from the very first user message
      if (!isBot && existingMessages.length === 0) {
        try {
          const groqApiKey = Deno.env.get("GROQ_API_KEY");
          if (groqApiKey) {
            const titleRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  {
                    role: "system",
                    content: "You name mental wellness chat sessions. Given the user's first message, reply with ONLY a short 2-4 word title (no quotes, no punctuation at the end) that captures the emotional topic — e.g. 'work stress spiral', 'trouble sleeping', 'feeling lonely', 'relationship worries'. Never repeat the user's exact words. Never mention names.",
                  },
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

      await kv.set(
        `user:${user.id}:session:${sessionId}`,
        session,
      );
    }
    return c.json({ success: true, messageId: newMessage.id });
  } catch (error) {
    console.log("Chat save error:", error);
    return c.json(
      { error: "Failed to save chat message" },
      500,
    );
  }
});

app.post(
  "/make-server-97cb3ddd/chat/sessions/:sessionId/messages/clear",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "No access token provided" },
          401,
        );
      }
      const supabase = getSupabaseAdmin();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const sessionId = c.req.param("sessionId");
      const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
      await kv.set(messagesKey, []);
      const sessionKey = `user:${user.id}:session:${sessionId}`;
      const session = await kv.get(sessionKey);
      if (session) {
        session.messageCount = 0;
        session.lastMessage = "";
        session.updatedAt = new Date().toISOString();
        await kv.set(sessionKey, session);
      }
      return c.json({ success: true, sessionId });
    } catch (error) {
      console.log("Clear history error:", error);
      return c.json(
        { error: "Failed to clear session messages" },
        500,
      );
    }
  },
);

app.get(
  "/make-server-97cb3ddd/chat/sessions/:sessionId/messages",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "No access token provided" },
          401,
        );
      }
      const supabase = getSupabaseAdmin();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const sessionId = c.req.param("sessionId");
      const messagesKey = `user:${user.id}:session:${sessionId}:messages`;
      const messages = (await kv.get(messagesKey)) || [];
      return c.json({ success: true, messages });
    } catch (error) {
      console.log("Chat history retrieval error:", error);
      return c.json(
        { error: "Failed to retrieve chat history" },
        500,
      );
    }
  },
);

app.get("/make-server-97cb3ddd/chat/history", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const historyKey = `user:${user.id}:chat_history`;
    const history = (await kv.get(historyKey)) || [];
    return c.json({ success: true, history });
  } catch (error) {
    console.log("Chat history retrieval error:", error);
    return c.json(
      { error: "Failed to retrieve chat history" },
      500,
    );
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
    // Remove session metadata + messages
    await kv.del(`user:${user.id}:session:${sessionId}`);
    await kv.del(`user:${user.id}:session:${sessionId}:messages`);
    // Remove from sessions index
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
    const { title } = await c.req.json();
    if (!title || typeof title !== "string") return c.json({ error: "Title is required" }, 400);
    const sessionKey = `user:${user.id}:session:${sessionId}`;
    const session = await kv.get(sessionKey);
    if (!session) return c.json({ error: "Session not found" }, 404);
    session.title = title.trim().slice(0, 60);
    session.updatedAt = new Date().toISOString();
    await kv.set(sessionKey, session);
    return c.json({ success: true, title: session.title });
  } catch (error) {
    console.log("Session rename error:", error);
    return c.json({ error: "Failed to rename session" }, 500);
  }
});

Deno.serve(app.fetch);