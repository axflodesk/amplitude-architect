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
    console.log("Parsed body:", JSON.stringify(body));

    const { description, imageBase64 } = body;

    if (!description && !imageBase64) {
      console.log("No description or image provided");
      return new Response(
        JSON.stringify({ error: "Description or image is required" }),
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
    console.log("API Key length:", apiKey?.length || 0);

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
        }
      },
      required: ["events"]
    };

    const SYSTEM_INSTRUCTION = `You are an Amplitude event tracking expert. Your task is to analyze product features and generate precise Amplitude event tracking specifications.

Generate tracking events that:
1. view: page identifier using lowercase with hyphens (e.g., "home", "pricing", "checkout")
2. click: click element identifier using lowercase with hyphens, or empty string "" for view-only events (e.g., "submit-button", "sign-up-cta", "footer-help")
3. eventName: FULL event name combining view and click:
   - For clicks: "view:<page>:click:<element>" (e.g., "view:pricing:click:submit-button", "view:home:click:footer-help")
   - For view-only: "view:<page>" (e.g., "view:pricing")
4. action: Human-readable description (e.g., "Click on submit button on pricing page")
5. eventProperties: JSON string of relevant context-based properties with possible values
   - Generate ONLY if there are meaningful properties to track based on the feature context
   - For empty properties, use empty string ""
   - Examples: "{\\"plan-type\\": [\\"free\\", \\"pro\\", \\"enterprise\\"]}" or "{\\"cta-location\\": [\\"header\\", \\"footer\\"]}"
   - Return empty string "" if no relevant properties exist

IMPORTANT NAMING RULES:
- Use lowercase letters and hyphens ONLY (no underscores or spaces)
- Examples: "submit-button", "sign-up-cta", "footer-help", "pricing-page", "checkout"
- eventName must ALWAYS follow format: "view:<page>:click:<element>" for clicks or "view:<page>" for view-only
- eventProperties keys and values must use lowercase with hyphens (e.g., "plan-type", "cta-location")

Return ONLY valid JSON matching the schema.`;

    const parts = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      });
    }

    parts.push({
      text: `Feature Description: ${description}\n\nGenerate appropriate Amplitude events for tracking this feature.`
    });

    console.log("Calling generateContent");
    const response = await model.generateContent({
      contents: [{ role: "user", parts }],
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

    const events = eventData.events;

    console.log("Creating result with IDs");
    const result = {
      events: events.map((event) => ({
        ...event,
        id: crypto.randomUUID()
      }))
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
