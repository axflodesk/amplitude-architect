import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT"
};

serve(async (req) => {
  console.log("Request received:", req.method, req.url);
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting request processing");
    const body = await req.json();
    console.log("Parsed body:", JSON.stringify(body).substring(0, 200));

    const { events, instruction } = body;

    if (!events || !instruction) {
      console.log("Missing events or instruction");
      return new Response(
        JSON.stringify({ error: "Events and instruction are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get API key from Supabase secrets
    console.log("Attempting to get GEMINI_API_KEY from environment");
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    console.log("API Key present:", !!apiKey);

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "API key not configured in Supabase Vault" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Import Gemini client
    console.log("Importing GoogleGenerativeAI");
    const genaiModule = await import("npm:@google/generative-ai");

    // Get GoogleGenerativeAI from module
    const GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;

    if (!GoogleGenerativeAI) {
      console.error("GoogleGenerativeAI not found. Available exports:", Object.keys(genaiModule));
      throw new Error("Cannot import GoogleGenerativeAI from @google/generative-ai");
    }

    console.log("Creating Gemini client");
    const client = new GoogleGenerativeAI(apiKey);
    console.log("Getting model");
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Model obtained successfully");

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

    const SYSTEM_INSTRUCTION = `You are an Amplitude event tracking expert. You help refine and improve event tracking specifications based on user feedback. CONSOLIDATE similar events using properties rather than creating separate events for each variation.

IMPORTANT RULES FOR CONSOLIDATION:
- Do NOT create separate events for content variations - use eventProperties instead
- Do NOT use content/values in click element names - use generic type names
- Multiple variations of the same element type should be ONE event with a property listing the variations
- Examples: Multiple templates → ONE event with template-name property, Multiple CTAs → ONE event with cta-location property

NAMING RULES:
- All identifiers must use lowercase letters and hyphens ONLY (no underscores or spaces)
- Use generic element names, not content-based names (e.g., "email-template" not "fresh-episode")
- eventName format:
  - For clicks: "view:<page>:click:<element>" (e.g., "view:email:click:email-template", "view:pricing:click:submit-button")
  - For view-only: "view:<page>" (e.g., "view:pricing")
- eventProperties format:
  - JSON string capturing variations: "{\\"template-name\\": [\\"Fresh Episode\\", \\"New Lotion\\"]}"
  - Use empty string "" if no variations
  - Keys and values must use lowercase with hyphens (e.g., "template-name", "cta-location")

Current events:
${JSON.stringify(events, null, 2)}

User instruction: ${instruction}

Apply the user's requested changes to the events. CONSOLIDATE any duplicate or variant events into single events with properties. Return the updated events and a brief explanation of what was changed.`;

    console.log("Calling generateContent");
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

    console.log("Got response, extracting content");

    // The actual response is wrapped, access it via response.response
    const actualResponse = response.response || response;
    console.log("Actual response type:", typeof actualResponse);
    console.log("Actual response keys:", Object.keys(actualResponse || {}));

    // Try to extract text from the actual response
    let text;
    if (typeof actualResponse?.text === 'function') {
      text = actualResponse.text();
      console.log("Got text from actualResponse.text()");
    } else if (typeof actualResponse?.text === 'string') {
      text = actualResponse.text;
      console.log("Got text from actualResponse.text (string property)");
    } else if (actualResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Extract from candidates structure
      text = actualResponse.candidates[0].content.parts[0].text;
      console.log("Got text from candidates[0].content.parts[0].text");
    } else {
      throw new Error(`Cannot extract text. Keys: ${Object.keys(actualResponse || {}).join(", ")}`);
    }

    console.log("Extracted text type:", typeof text);

    // Parse the JSON text
    let eventData;
    if (typeof text === 'string') {
      eventData = JSON.parse(text);
    } else {
      eventData = text;
    }

    console.log("Extracted event data successfully");

    // Validate events exist
    if (!eventData.events || !Array.isArray(eventData.events)) {
      throw new Error(`Response does not contain valid 'events' array. Got: ${JSON.stringify(eventData).substring(0, 200)}`);
    }

    const refinedEvents = eventData.events;
    const message = eventData.message || "I've updated the event list based on your feedback.";

    console.log("Creating result with IDs");
    const result = {
      events: refinedEvents.map((event) => ({
        ...event,
        id: event.id || crypto.randomUUID()
      })),
      message: message
    };

    console.log("Sending response with", result.events.length, "events");
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Caught error:", error);
    console.error("Error type:", error instanceof Error ? "Error" : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "no stack");
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? "Error" : typeof error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
