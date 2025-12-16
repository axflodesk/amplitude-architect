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

      // Try to extract more detailed error information
      const errorDetails = data?.error || error.message || 'Failed to generate events';
      console.error("Error details:", errorDetails);

      throw new Error(errorDetails);
    }

    if (!data) {
      console.error("No data received from function");
      throw new Error('No response data from generateEvents function');
    }

    if (!data.events) {
      console.error("Invalid response structure:", data);
      // Check if there's an error field in the data
      if (data.error) {
        throw new Error(`Function error: ${data.error}`);
      }
      throw new Error('Invalid response from generateEvents function - missing events');
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
    console.log("Invoking refineEvents function...");
    console.log("Current events count:", currentEvents.length);
    console.log("User instruction:", userInstruction);

    const { data, error } = await supabase.functions.invoke('refineEvents', {
      body: {
        events: currentEvents.map(({ id, ...rest }) => rest),
        instruction: userInstruction
      }
    });

    console.log("Refine response received:", { data, error });

    if (error) {
      console.error("Function error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to refine events');
    }

    if (!data) {
      console.error("No data in response");
      throw new Error('No response data from refineEvents function');
    }

    if (!data.events) {
      console.error("Missing events in response:", data);
      throw new Error('Invalid response from refineEvents function - missing events');
    }

    console.log("Successfully refined", data.events.length, "events");
    return {
      events: data.events,
      message: data.message || "I've updated the event list based on your feedback."
    };
  } catch (error) {
    console.error("Event Refinement Error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Full error:", errorMsg);
    throw error;
  }
};
