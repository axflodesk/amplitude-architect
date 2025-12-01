import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GeminiClient } from "../lib/geminiClient.ts";
import { GenerateEventsRequest, GenerateEventsResponse } from "../lib/types.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { description, imageBase64 } = await req.json() as GenerateEventsRequest;

    if (!description && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Description or image is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get API key from Supabase secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate events using Gemini
    const gemini = new GeminiClient(apiKey);
    const events = await gemini.generateEvents(description, imageBase64);

    const response: GenerateEventsResponse = {
      events: events.map((event, index) => ({
        ...event,
        id: crypto.randomUUID()
      }))
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
