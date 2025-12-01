import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GeminiClient } from "../lib/geminiClient.ts";
import { RefineEventsRequest, RefineEventsResponse } from "../lib/types.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { events, instruction } = await req.json() as RefineEventsRequest;

    if (!events || !instruction) {
      return new Response(
        JSON.stringify({ error: "Events and instruction are required" }),
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

    // Refine events using Gemini
    const gemini = new GeminiClient(apiKey);
    const result = await gemini.refineEvents(events, instruction);

    const response: RefineEventsResponse = {
      events: result.events.map((event) => ({
        ...event,
        id: event.id || crypto.randomUUID()
      })),
      message: result.message
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
