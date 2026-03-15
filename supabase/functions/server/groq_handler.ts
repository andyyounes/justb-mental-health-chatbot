// supabase/functions/server/groq_handler.ts
import { serve } from "jsr:@supabase/functions-framework";

serve(async (req) => {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  if (!groqApiKey) {
    return new Response(
      JSON.stringify({ error: "Groq API key missing" }),
      { status: 500 }
    );
  }

  const { message } = await req.json();

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mixtral-8x7b",
      messages: [
        { role: "user", content: message }
      ],
    }),
  });

  const result = await groqResponse.json();
  return new Response(JSON.stringify(result));
});
