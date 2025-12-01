import React, { useState, useRef } from 'react';
import { IconActivity } from './components/icons';
import { InputSection } from './components/InputSection';
import { EventTable } from './components/EventTable';
import { ChatInterface } from './components/ChatInterface';
import { AmplitudeEvent, ChatMessage, AppState } from './types';
import { generateEventsFromInput, refineEventsWithChat } from './services/geminiService';

// System prompt info integrated via popover
export default function App() {
  const [events, setEvents] = useState<AmplitudeEvent[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Lifted state for input persistence
  const [inputDescription, setInputDescription] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const wasStoppedByUserRef = useRef(false);

  const handleGenerate = async () => {
    if (!inputDescription.trim() && !inputImage) return;

    // Reset stop flag for new request
    wasStoppedByUserRef.current = false;

    setHasGenerated(true);
    setAppState(AppState.GENERATING);

    // Create user message with image and description
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputDescription || 'Generate events for this feature',
      imageData: inputImage || undefined,
      timestamp: Date.now()
    };
    setChatHistory([userMessage]);

    try {
      const generatedEvents = await generateEventsFromInput(inputDescription, inputImage || undefined);

      // Don't process response if user stopped it
      if (wasStoppedByUserRef.current) {
        return;
      }

      setEvents(generatedEvents);

      // Add assistant response
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: `I've analyzed your input and generated ${generatedEvents.length} events. Review the table below. You can chat with me to refine them.`,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      // Don't show error message if user stopped it
      if (wasStoppedByUserRef.current) {
        return;
      }

      alert("Failed to generate events. Please check your API key and try again.");
    } finally {
      setAppState(AppState.IDLE);
      setAbortController(null);
    }
  };

  const handleChat = async (message: string) => {
    // Reset stop flag for new request
    wasStoppedByUserRef.current = false;

    // Optimistic user update
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setAppState(AppState.REFINING);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const { events: updatedEvents, message: botText } = await refineEventsWithChat(events, message);

      // Don't process response if user stopped it
      if (wasStoppedByUserRef.current) {
        return;
      }

      setEvents(updatedEvents);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: botText,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);

      // Don't show error message if user stopped it
      if (wasStoppedByUserRef.current) {
        return;
      }

      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Sorry, I encountered an error updating the events.",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setAppState(AppState.IDLE);
      setAbortController(null);
    }
  };

  const handleStopProcessing = () => {
    wasStoppedByUserRef.current = true;
    setAppState(AppState.IDLE);
    setAbortController(null);

    const stoppedMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: "Processing stopped by user.",
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, stoppedMsg]);
  };

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col">
      {/* Header */}
      <header className="bg-transparent sticky top-0 z-50 flex-none">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center relative">
          <button
            onClick={() => {
              setHasGenerated(false);
              setEvents([]);
              setChatHistory([]);
              setInputDescription('');
              setInputImage(null);
            }}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <div className="text-primary">
              <IconActivity width={32} height={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-tight">Instrumentator</h1>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col">
        {!hasGenerated ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="w-full max-w-lg space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold tracking-tight text-primary/85">
                  Image recognition finds your{' '}
                  <img
                    src="https://cdn.prod.website-files.com/64da81538e9bdebe7ae2fa11/64ee6c441b07b9e11db3dc92_A%20mark%20circle.svg"
                    alt="Amplitude"
                    className="w-12 h-12 inline-block align-middle opacity-60"
                  />
                  {' '}events
                </h2>
              </div>
              
              <InputSection 
                description={inputDescription}
                setDescription={setInputDescription}
                imagePreview={inputImage}
                setImagePreview={setInputImage}
                onGenerate={handleGenerate} 
                isGenerating={appState === AppState.GENERATING} 
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500">
            {/* Left Column: Unified Chat Assistant */}
            <div className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden">
              <ChatInterface
                messages={chatHistory}
                onSendMessage={handleChat}
                isProcessing={appState === AppState.GENERATING || appState === AppState.REFINING}
                onStopProcessing={handleStopProcessing}
              />
            </div>

            {/* Right Column: Table */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
               <div className="flex-1 min-h-0">
                  <EventTable events={events} isLoading={appState === AppState.GENERATING} />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}