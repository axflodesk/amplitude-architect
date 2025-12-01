import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT"
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { events, instruction } = await req.json();

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

    // Import Gemini client
    const genaiModule = await import("npm:@google/generative-ai");
    const GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;
    if (!GoogleGenerativeAI) {
      throw new Error("Cannot import GoogleGenerativeAI from @google/generative-ai");
    }
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const EVENT_SCHEMA = {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              view: { type: "string" },
              click: { type: "string" },
              eventName: { type: "string" },
              eventProperties: { type: "string" }
            },
            required: ["action", "view", "click", "eventName", "eventProperties"]
          }
        },
        message: { type: "string" }
      },
      required: ["events", "message"]
    };

    const SYSTEM_INSTRUCTION = `You are an Amplitude event tracking expert. You help refine and improve event tracking specifications based on user feedback.

IMPORTANT NAMING RULES:
- All identifiers must use lowercase letters and hyphens ONLY (no underscores or spaces)
- Examples: "submit-button", "sign-up-cta", "footer-help", "pricing-page"
- eventName format:
  - For clicks: "view:<page>:click:<element>" (e.g., "view:pricing:click:submit-button", "view:home:click:footer-help")
  - For view-only: "view:<page>" (e.g., "view:pricing")
- eventProperties format:
  - JSON string of relevant context-based properties with possible values
  - Use empty string "" if no relevant properties exist
  - Examples: "{\\"plan-type\\": [\\"free\\", \\"pro\\", \\"enterprise\\"]}" or "{\\"cta-location\\": [\\"header\\", \\"footer\\"]}"
  - Keys and values must use lowercase with hyphens (e.g., "plan-type", "cta-location")

Current events:
${JSON.stringify(events, null, 2)}

User instruction: ${instruction}

Apply the user's requested changes to the events. Return the updated events and a brief explanation of what was changed. Ensure all identifiers follow the naming rules (lowercase with hyphens), eventName follows the correct format, and eventProperties are meaningful or empty strings.`;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Please refine these Amplitude events according to: ${instruction}`
            }
          ]
        }
      ],
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseSchema: EVENT_SCHEMA,
        responseMimeType: "application/json"
      }
    });

    // The actual response is wrapped, access it via response.response
    const actualResponse = response.response || response;

    // Extract text from the actual response
    let text;
    if (typeof actualResponse?.text === 'function') {
      text = actualResponse.text();
    } else if (typeof actualResponse?.text === 'string') {
      text = actualResponse.text;
    } else if (actualResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Extract from candidates structure
      text = actualResponse.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Cannot extract text from response");
    }

    // Parse the JSON text
    let eventData;
    if (typeof text === 'string') {
      eventData = JSON.parse(text);
    } else {
      eventData = text;
    }

    const events = eventData.events || [];
    const message = eventData.message || "";

    const result = {
      events: events.map((event) => ({
        ...event,
        id: event.id || crypto.randomUUID()
      })),
      message: message
    };

    return new Response(JSON.stringify(result), {
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
