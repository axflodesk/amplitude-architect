import { GoogleGenerativeAI } from "npm:@google/genai";
import { AmplitudeEvent } from "./types.ts";

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateEvents(
    description: string,
    imageBase64?: string
  ): Promise<AmplitudeEvent[]> {
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

Given a feature description and/or screenshot, generate tracking events that:
1. Follow Amplitude's naming conventions: view:<page> for page views, click:<element> for click events
2. Include complete event properties with possible values
3. Cover all user interactions mentioned
4. For view-only scenarios (no clicks), set click field to empty string ""

Return ONLY valid JSON matching the provided schema, no other text.`;

    const messages: any[] = [
      {
        role: "user",
        parts: [
          {
            text: `Feature Description: ${description}\n\nGenerate appropriate Amplitude events for tracking this feature.`
          }
        ]
      }
    ];

    if (imageBase64) {
      // Insert image as the first part
      messages[0].parts.unshift({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      });
    }

    const response = await this.model.generateContent({
      contents: messages,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseSchema: EVENT_SCHEMA,
        responseMimeType: "application/json"
      }
    });

    const text = response.response.text();
    const parsed = JSON.parse(text);
    return parsed.events;
  }

  async refineEvents(
    events: AmplitudeEvent[],
    instruction: string
  ): Promise<{ events: AmplitudeEvent[]; message: string }> {
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

Current events:
${JSON.stringify(events, null, 2)}

User instruction: ${instruction}

Apply the user's requested changes to the events. Return the updated events and a brief explanation of what was changed.`;

    const response = await this.model.generateContent({
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

    const text = response.response.text();
    const parsed = JSON.parse(text);
    return parsed;
  }
}
