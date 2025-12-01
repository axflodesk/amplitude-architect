import { supabase } from "../lib/supabaseClient";
import { AmplitudeEvent } from "../types";

export const generateEventsFromInput = async (
  description: string,
  imageBase64?: string
): Promise<AmplitudeEvent[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generateEvents', {
      body: {
        description,
        imageBase64: imageBase64 ? imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') : undefined
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate events');
    }

    if (!data || !data.events) {
      throw new Error('Invalid response from generateEvents function');
    }

    return data.events;
  } catch (error) {
    console.error("Event Generation Error:", error);
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
