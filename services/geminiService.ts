import { supabase } from "../lib/supabaseClient";
import { AmplitudeEvent } from "../types";

export const generateEventsFromInput = async (
  description: string,
  imageBase64?: string
): Promise<AmplitudeEvent[]> => {
  try {
    console.log("Invoking generateEvents function...");
    const { data, error } = await supabase.functions.invoke('generateEvents', {
      body: {
        description,
        imageBase64: imageBase64 ? imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') : undefined
      }
    });

    console.log("Response received:", { data, error });

    if (error) {
      console.error("Function error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to generate events');
    }

    if (!data || !data.events) {
      console.error("Invalid response:", data);
      throw new Error('Invalid response from generateEvents function');
    }

    console.log("Successfully generated", data.events.length, "events");
    return data.events;
  } catch (error) {
    console.error("Event Generation Error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Full error:", errorMsg);
    throw error;
  }
};

export const refineEventsWithChat = async (
  currentEvents: AmplitudeEvent[],
  userInstruction: string
): Promise<{ events: AmplitudeEvent[], message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('refineEvents', {
      body: {
        events: currentEvents.map(({ id, ...rest }) => rest),
        instruction: userInstruction
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to refine events');
    }

    if (!data || !data.events) {
      throw new Error('Invalid response from refineEvents function');
    }

    return {
      events: data.events,
      message: data.message || "I've updated the event list based on your feedback."
    };
  } catch (error) {
    console.error("Event Refinement Error:", error);
    throw error;
  }
};
