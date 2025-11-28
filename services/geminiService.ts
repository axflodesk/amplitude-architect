import { GoogleGenAI, Type } from "@google/genai";
import { AmplitudeEvent } from "../types";

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const EVENT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Descriptive human-readable action (e.g., 'Click on plan card CTA')" },
      view: { type: Type.STRING, description: "The view/page identifier (e.g., 'view:pricing')" },
      click: { type: Type.STRING, description: "The click identifier (e.g., 'click:plan-card-CTA')" },
      eventName: { type: Type.STRING, description: "The full event name string (e.g., 'view:pricing:click:plan-card-CTA')" },
      eventProperties: { type: Type.STRING, description: "Detailed properties and their potential values." }
    },
    required: ["action", "view", "click", "eventName", "eventProperties"]
  }
};

const SYSTEM_INSTRUCTION = `
You are an expert Product Manager and Data Analyst specializing in Amplitude instrumentation.
Your goal is to generate precise, consistent, and useful tracking events for software applications.

Format Guidelines:
- **Action**: Human readable description of the user action.
- **View**: 'view:<page_name>'
- **Click**: 'click:<element_name>' (if applicable) or other action verb.
- **Event name**: combined scope usually 'view:<page>:click:<element>'
- **Event properties**: List key-value pairs or property descriptions clearly. E.g., "Plan: [Free, Pro], Source: [Header, Footer]"

Analyze the inputs (images and text) to determine the necessary events to track user interaction fully.
`;

export const generateEventsFromInput = async (
  description: string,
  imageBase64?: string
): Promise<AmplitudeEvent[]> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      // Clean base64 string if it contains the data header
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/png' // Assuming png for simplicity, API handles standard types
        }
      });
    }

    if (description) {
      parts.push({
        text: `Feature Description: ${description}\n\nPlease generate a list of Amplitude events for this feature.`
      });
    } else if (parts.length > 0) {
      parts.push({
        text: "Generate a list of Amplitude events based on this UI screenshot."
      });
    } else {
        throw new Error("No input provided");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Capable of reasoning and vision
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: EVENT_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawEvents = JSON.parse(text);
    
    // Add IDs for React keys
    return rawEvents.map((e: any) => ({
      ...e,
      id: crypto.randomUUID()
    }));

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const refineEventsWithChat = async (
  currentEvents: AmplitudeEvent[],
  userInstruction: string
): Promise<{ events: AmplitudeEvent[], message: string }> => {
  try {
    const prompt = `
    Current Event Instrumentation List (JSON):
    ${JSON.stringify(currentEvents.map(({id, ...rest}) => rest), null, 2)}

    User Request: "${userInstruction}"

    Instructions:
    1. Update the event list based on the user's request. 
    2. Add, remove, or modify events as needed.
    3. Return the NEW full list of events in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: EVENT_SCHEMA,
      }
    });

     const text = response.text;
    if (!text) throw new Error("No response from AI");

    const rawEvents = JSON.parse(text);
    const newEvents = rawEvents.map((e: any) => ({
      ...e,
      id: crypto.randomUUID()
    }));

    return {
        events: newEvents,
        message: "I've updated the event list based on your feedback."
    };

  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    throw error;
  }
};
