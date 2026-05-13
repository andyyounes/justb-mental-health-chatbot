// pinecone_rag.ts — Pinecone RAG + HuggingFace embeddings + DistilBERT safety
// Requires Supabase secrets: PINECONE_API_KEY, HUGGINGFACE_API_KEY

// ============================================================
// MENTAL HEALTH KNOWLEDGE BASE
// ============================================================
export const KNOWLEDGE_BASE = [
  {
    id: "box-breathing",
    text: "Box breathing (4-4-4-4 technique): Inhale slowly for 4 counts, hold for 4 counts, exhale for 4 counts, hold empty for 4 counts. Repeat 4–8 cycles. Activates the parasympathetic nervous system, rapidly reduces acute anxiety, lowers cortisol, and brings the body out of fight-or-flight. Widely used by military and first responders.",
  },
  {
    id: "478-breathing",
    text: "4-7-8 breathing: Inhale quietly through the nose for 4 seconds, hold the breath for 7 seconds, exhale completely through the mouth for 8 seconds. Developed from pranayama yoga. Excellent for insomnia, acute anxiety attacks, and managing anger. Repeat up to 4 cycles at first, increasing to 8 over time.",
  },
  {
    id: "diaphragmatic-breathing",
    text: "Diaphragmatic (belly) breathing: Place one hand on chest and one on belly. Breathe so only the belly hand rises. Slow inhale 4–5 seconds, slow exhale 4–5 seconds. Corrects shallow chest breathing that worsens anxiety. Practice 10 minutes daily for lasting anxiety and stress reduction.",
  },
  {
    id: "grounding-54321",
    text: "5-4-3-2-1 grounding technique for anxiety and panic: Name 5 things you can see, 4 things you can physically feel, 3 things you can hear, 2 things you can smell, 1 thing you can taste. Anchors attention to the present moment, interrupts dissociation and rumination, and stops anxiety spirals by re-engaging the senses.",
  },
  {
    id: "progressive-muscle-relaxation",
    text: "Progressive muscle relaxation (PMR): Systematically tense each muscle group for 5–7 seconds then release for 30 seconds, working from toes upward to the face. Reduces physical tension accumulated from chronic stress, anxiety, and PTSD. Regular practice (15–20 minutes) lowers baseline muscle tension and improves sleep quality.",
  },
  {
    id: "body-scan-meditation",
    text: "Body scan meditation: Lie comfortably, eyes closed. Slowly sweep awareness from feet to crown of head, spending 1–2 minutes at each body area. Notice sensations—warmth, tightness, tingling—without judgment or trying to change them. Effective for chronic pain, stress, anxiety, and insomnia. MBSR core practice.",
  },
  {
    id: "safe-place-visualization",
    text: "Safe place visualization: Eyes closed, imagine a peaceful place in vivid sensory detail—see the colors, hear the sounds, feel the textures, notice any scents. Can be real (a childhood bedroom) or imagined (a forest clearing). Use a cue word or image to re-enter quickly. Reduces anxiety, helps manage trauma responses, and promotes deep relaxation.",
  },
  {
    id: "cognitive-restructuring",
    text: "Cognitive restructuring for negative thoughts: 1) Identify the automatic negative thought. 2) Note the emotion and intensity (0–10). 3) Find evidence FOR the thought. 4) Find evidence AGAINST the thought. 5) Write a balanced, realistic alternative thought. 6) Rate emotion intensity again. Core CBT technique for anxiety, depression, and negative self-talk.",
  },
  {
    id: "journaling-therapy",
    text: "Therapeutic journaling: Write freely for 15–20 minutes about difficult thoughts and emotions without editing or judgment (expressive writing). Alternatively, gratitude journaling—write 3 specific good things from today each night. Expressive writing reduces depression and PTSD symptoms; gratitude journaling increases life satisfaction and positive emotion. Both require only 3–4 weeks to see benefits.",
  },
  {
    id: "sleep-hygiene",
    text: "Evidence-based sleep hygiene for insomnia: Maintain a consistent sleep-wake schedule 7 days a week. Keep bedroom cool (65–68°F), dark, and quiet. Avoid screens 1 hour before bed (blue light suppresses melatonin). No caffeine after 2 PM. Avoid alcohol—it fragments sleep cycles. No heavy meals 2–3 hours before bed. Get bright light exposure in the morning. If awake 20+ minutes, get up and do something calm until sleepy.",
  },
  {
    id: "panic-attack-management",
    text: "Managing panic attacks: A panic attack peaks in 10 minutes and cannot cause physical harm. During an attack: 1) Remind yourself it will pass and you are safe. 2) Focus on slow, controlled breathing using 4-7-8 technique. 3) Ground yourself with 5-4-3-2-1. 4) Stay where you are—avoidance reinforces panic. 5) Accept the sensations rather than fighting them. Between attacks, gradual exposure to triggers reduces their power.",
  },
  {
    id: "social-anxiety-coping",
    text: "Coping strategies for social anxiety: Gradual exposure hierarchy (start with least feared situations, work up slowly). Before events: slow breathing, realistic thought-challenging. During events: focus attention outward on others, not inward on yourself. After events: write down 3 things that went OK (counter the post-event processing spiral). Self-compassion for awkward moments. Therapy (CBT, ACT) is highly effective long-term.",
  },
  {
    id: "depression-behavioral-activation",
    text: "Behavioral activation for depression: Depression creates a cycle of low mood → withdrawal → lower mood. Break it by scheduling small, achievable activities—even 5 minutes of something once pleasurable. Break tasks into tiny steps. Track mood patterns to identify energy windows. Maintain daily routine and social contact. Regular moderate exercise is as effective as antidepressants for mild-moderate depression.",
  },
  {
    id: "anger-management",
    text: "Anger management techniques: Recognize early physical warning signs (tension in jaw, heat in face). Take a 10-minute break before responding—anger hijacks rational thinking. Use slow diaphragmatic breathing to lower arousal. Challenge all-or-nothing interpretations. Identify the underlying need or fear driving the anger. Practice assertive (not aggressive) expression of needs. Regular exercise provides a healthy outlet for stress hormones.",
  },
  {
    id: "self-compassion-practice",
    text: "Self-compassion practice (Kristin Neff model): 1) Mindfulness—acknowledge suffering without exaggerating or suppressing it. 2) Common humanity—remember suffering and imperfection are universal human experiences. 3) Self-kindness—speak to yourself as you would to a close friend who was struggling. Reduces shame, self-criticism, perfectionism, and depression. Self-compassion journaling: How would a kind friend respond to your situation?",
  },
  {
    id: "stress-management",
    text: "Comprehensive stress management: Identify and categorize stressors (changeable vs. unchangeable). Use problem-solving for changeable ones. For unchangeable ones, use acceptance, distancing, and meaning-making. Regular exercise, 7–9 hours sleep, and social connection are foundational. Time-boxing and prioritization reduce task overwhelm. Set clear work-rest boundaries. Limit news and social media to defined windows. Weekly reflection on what went well.",
  },
  {
    id: "relationship-anxiety",
    text: "Managing relationship anxiety: Identify attachment style (anxious, avoidant, secure) to understand patterns. Communicate needs clearly and specifically without blame. Challenge mind-reading assumptions. Practice self-soothing before seeking reassurance—reassurance-seeking temporarily relieves but maintains long-term anxiety. Maintain individual interests and friendships. Couples therapy and individual therapy for attachment wounds are highly effective.",
  },
  {
    id: "grief-coping",
    text: "Coping with grief and loss: Grief is not linear—the stage model is a guide, not a rule. Allow yourself to feel all emotions without judgment; grief demands expression. Talk about the person you lost. Maintain daily structure and self-care basics (eating, sleep, movement). Honor the relationship with small rituals. Grief support groups reduce isolation. Complicated grief (unrelenting intensity after 12 months) benefits from specialized therapy.",
  },
  {
    id: "trauma-grounding",
    text: "Trauma-informed grounding and stabilization: During flashbacks or dissociation—hold an ice cube (intense sensation = present focus), run cold water over wrists, smell strong scents (peppermint, coffee), stamp feet on floor to feel gravity, say your name and today's date aloud. 5-4-3-2-1 sensory grounding. These techniques interrupt trauma responses and reconnect with present-moment safety before doing any trauma processing.",
  },
  {
    id: "mindfulness-beginners",
    text: "Mindfulness meditation for beginners: Sit comfortably, set a timer for 5–10 minutes. Focus on the physical sensation of breathing—at the nostrils, chest, or belly. When the mind wanders (it will—this is normal), gently and without judgment redirect attention back to the breath. This is the practice. Apps like Headspace and Insight Timer provide guided sessions. 8 weeks of daily practice produces measurable changes in brain regions regulating emotion and stress.",
  },
  {
    id: "generalized-anxiety-disorder",
    text: "Generalized Anxiety Disorder (GAD) involves persistent, difficult-to-control worry about multiple life domains—health, finances, work, relationships—for more than 6 months. Physical symptoms include muscle tension, fatigue, difficulty concentrating, irritability, and disrupted sleep. Effective treatments include CBT (especially worry exposure and postponement), acceptance-based therapy (ACT), and medication when needed. Recognizing GAD as a treatable condition—not a character flaw—is the first step.",
  },
  {
    id: "depression-symptoms",
    text: "Depression symptoms to recognize: persistent low or empty mood most of the day, loss of interest or pleasure in activities once enjoyed (anhedonia), changes in sleep (too much or too little), appetite and weight changes, fatigue, difficulty concentrating or making decisions, feelings of worthlessness or excessive guilt, and in severe cases, thoughts of death or suicide. Symptoms lasting 2+ weeks that interfere with daily life warrant professional evaluation. Depression is highly treatable—most people respond to therapy, medication, or both.",
  },
  {
    id: "cbt-cognitive-reframing",
    text: "CBT cognitive reframing challenges distorted thinking patterns by asking: Is this thought based on facts or feelings? Am I catastrophizing (assuming worst case)? Am I mind-reading (assuming I know what others think)? Am I overgeneralizing ('I always fail')? Replace the distorted thought with a more balanced one: 'I made a mistake' instead of 'I'm a failure.' Reframing doesn't mean forced positivity—it means accuracy. Regular practice rewires habitual negative thought patterns over weeks.",
  },
  {
    id: "burnout-recovery",
    text: "Burnout recovery requires addressing all three dimensions: emotional exhaustion, depersonalization, and reduced sense of accomplishment. Start with immediate relief: take genuine rest (not passive scrolling), set firm work boundaries, and remove at least one obligation. Medium-term: identify which values your work violates and which it supports. Reconnect with activities that restore energy. Long-term: restructure workload, seek support from a manager or therapist, and rebuild a sustainable pace. Burnout recovery takes months—expect a gradual curve, not a switch.",
  },
  {
    id: "act-acceptance",
    text: "Acceptance and Commitment Therapy (ACT) core principle: psychological suffering comes from struggling against unavoidable pain. Instead of fighting thoughts and feelings, practice 'defusion'—observe them as passing mental events rather than facts. Say 'I notice I'm having the thought that I'm a failure' rather than 'I'm a failure.' Identify your core values and commit to small actions aligned with them, even when anxiety is present. ACT is highly effective for anxiety, depression, and chronic pain.",
  },
  {
    id: "worry-postponement",
    text: "Worry postponement technique for generalized anxiety: Schedule a specific 20-minute 'worry window' each day (e.g., 5–5:20 PM). When worries arise outside this time, write them down briefly and deliberately postpone them. At your worry window, review the list and problem-solve if needed. Most worries will feel less urgent by then. This technique breaks the habit of constant background worry and gives your mind permission to focus on the present.",
  },
  {
    id: "emotional-regulation-dbt",
    text: "DBT emotion regulation skills: PLEASE skills—treat PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise. TIPP for crisis—Temperature (cold water on face activates dive reflex, slows heart rate), Intense exercise, Paced breathing, Paired muscle relaxation. Opposite action—when the emotion urge is not justified, act opposite (approach when fear says avoid; engage when depression says withdraw). These are evidence-based tools from Dialectical Behavior Therapy.",
  },
  {
    id: "safety-planning",
    text: "Personal safety planning for suicidal thoughts: A written plan created in advance with a therapist includes: warning signs to watch for, internal coping strategies to use alone, social contacts and activities that provide distraction, people to call for support, professionals and crisis lines to contact, and steps to make the environment safer. Safety plans are more effective than safety contracts. Crisis numbers: USA 988, UK 116 123, Australia +61 13 11 14, Armenia +374 80 001 800, International: findahelpline.com.",
  },
  {
    id: "exercise-mental-health",
    text: "Exercise as mental health treatment: 30 minutes of moderate aerobic exercise (brisk walking, cycling, swimming) 3–5 times per week is as effective as antidepressants for mild-to-moderate depression. Exercise increases BDNF (brain growth factor), reduces cortisol, and releases endorphins and endocannabinoids. Even a single 10-minute walk immediately improves mood and reduces anxiety. Resistance training also reduces anxiety and depression symptoms. Starting small and building consistency matters more than intensity.",
  },
];

// ============================================================
// HUGGING FACE EMBEDDINGS (sentence-transformers/all-MiniLM-L6-v2)
// ============================================================
export async function getEmbedding(text: string, hfApiKey: string): Promise<number[]> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    },
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace embedding error ${response.status}: ${err}`);
  }
  const data = await response.json();
  // API returns [[...embedding]] for single input
  return Array.isArray(data[0]) ? data[0] : data;
}

// ============================================================
// PINECONE INDEX DISCOVERY
// ============================================================
export async function getPineconeIndexHost(
  apiKey: string,
  indexName: string,
): Promise<string> {
  const response = await fetch(
    `https://api.pinecone.io/indexes/${encodeURIComponent(indexName)}`,
    { headers: { "Api-Key": apiKey } },
  );
  if (!response.ok) {
    throw new Error(`Pinecone: index '${indexName}' not found (${response.status}). Create it first via /pinecone/init`);
  }
  const data = await response.json();
  if (!data.host) throw new Error("Pinecone index missing 'host' field");
  return data.host as string;
}

// ============================================================
// PINECONE CREATE INDEX (serverless)
// ============================================================
export async function createPineconeIndex(
  apiKey: string,
  indexName: string,
): Promise<void> {
  // Check if already exists
  const check = await fetch(
    `https://api.pinecone.io/indexes/${encodeURIComponent(indexName)}`,
    { headers: { "Api-Key": apiKey } },
  );
  if (check.ok) return; // Already exists

  const response = await fetch("https://api.pinecone.io/indexes", {
    method: "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: indexName,
      dimension: 384, // all-MiniLM-L6-v2 output dimension
      metric: "cosine",
      spec: {
        serverless: { cloud: "aws", region: "us-east-1" },
      },
    }),
  });
  if (!response.ok && response.status !== 409) {
    const err = await response.text();
    throw new Error(`Pinecone create index error ${response.status}: ${err}`);
  }

  // Wait for index to be ready (up to 60s)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.pinecone.io/indexes/${encodeURIComponent(indexName)}`,
      { headers: { "Api-Key": apiKey } },
    );
    if (statusRes.ok) {
      const s = await statusRes.json();
      if (s.status?.ready === true) return;
    }
  }
}

// ============================================================
// PINECONE UPSERT
// ============================================================
export async function pineconeUpsert(
  vectors: Array<{ id: string; values: number[]; metadata: { text: string } }>,
  apiKey: string,
  indexHost: string,
): Promise<void> {
  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    const response = await fetch(`https://${indexHost}/vectors/upsert`, {
      method: "POST",
      headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ vectors: batch }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Pinecone upsert error ${response.status}: ${err}`);
    }
  }
}

// ============================================================
// PINECONE QUERY
// ============================================================
export async function pineconeQuery(
  queryVector: number[],
  topK: number,
  apiKey: string,
  indexHost: string,
): Promise<Array<{ text: string; score: number }>> {
  const response = await fetch(`https://${indexHost}/query`, {
    method: "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      vector: queryVector,
      topK,
      includeMetadata: true,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinecone query error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return (data.matches || []).map((m: any) => ({
    text: m.metadata?.text || "",
    score: m.score || 0,
  }));
}

// ============================================================
// DISTILBERT SAFETY CHECK
// Uses distilbert-base-uncased-finetuned-sst-2-english for
// sentiment analysis + keyword checks for harmful content.
// Fails open — if HuggingFace is unreachable, response is allowed.
// ============================================================
export async function checkResponseSafety(
  responseText: string,
  hfApiKey: string,
): Promise<{ safe: boolean; reason: string }> {
  const HARMFUL_PHRASES = [
    "you should end your life",
    "killing yourself",
    "you deserve to die",
    "nobody cares about you",
    "you're worthless",
    "go ahead and do it",
    "just do it already",
  ];

  const lower = responseText.toLowerCase();
  for (const phrase of HARMFUL_PHRASES) {
    if (lower.includes(phrase)) {
      return { safe: false, reason: `Contains harmful phrase: "${phrase}"` };
    }
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: responseText.slice(0, 512),
          options: { wait_for_model: true },
        }),
      },
    );
    if (!response.ok) return { safe: true, reason: "HuggingFace unavailable — allowed" };
    const data = await response.json();

    // data: [[{label: "NEGATIVE", score: 0.9}, {label: "POSITIVE", score: 0.1}]]
    const results: Array<{ label: string; score: number }> = data[0] ?? [];
    const negScore = results.find((r) => r.label === "NEGATIVE")?.score ?? 0;

    // Only flag if overwhelmingly negative AND contains concerning context
    if (negScore > 0.97) {
      const concerningContext = [
        "harm", "hurt", "die", "death", "kill", "pain", "worthless", "hopeless",
      ].some((w) => lower.includes(w));
      if (concerningContext) {
        return {
          safe: false,
          reason: `High negative sentiment (${Math.round(negScore * 100)}%) with concerning context`,
        };
      }
    }
    return { safe: true, reason: "OK" };
  } catch {
    return { safe: true, reason: "Safety check unavailable — allowed" };
  }
}
