import React, { useState } from 'react';
import { IconActivity, IconCocktail } from './components/icons';
import { InputSection } from './components/InputSection';
import { EventTable } from './components/EventTable';
import { ChatInterface } from './components/ChatInterface';
import { SystemPromptPopover } from './components/SystemPromptPopover';
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

  const handleGenerate = async () => {
    if (!inputDescription.trim() && !inputImage) return;

    setHasGenerated(true);
    setAppState(AppState.GENERATING);
    try {
      const generatedEvents = await generateEventsFromInput(inputDescription, inputImage || undefined);
      setEvents(generatedEvents);
      // Clear chat history on new generation
      setChatHistory([{
        id: crypto.randomUUID(),
        role: 'model',
        text: `I've analyzed your input and generated ${generatedEvents.length} events. Review the table below. You can chat with me to refine them.`,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate events. Please check your API key and try again.");
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const handleChat = async (message: string) => {
    // Optimistic user update
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setAppState(AppState.REFINING);

    try {
      const { events: updatedEvents, message: botText } = await refineEventsWithChat(events, message);
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
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Sorry, I encountered an error updating the events.",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col">
      {/* Header */}
      <header className="bg-transparent sticky top-0 z-50 flex-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
              <IconActivity width={24} height={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight">Instrumentator</h1>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <SystemPromptPopover />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col">
        {!hasGenerated ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <h2 className="text-7xl font-bold tracking-tight text-primary">
                  Tracking specs generator
                </h2>
                <p className="text-xl text-primary/70 max-w-xs mx-auto flex items-center justify-center gap-1 flex-wrap">
                  Relax{' '}
                  <IconCocktail width={20} height={20} className="text-primary/70" />
                  {' '}and let AI hallucinate your{' '}
                  <img
                    src="https://cdn.prod.website-files.com/64da81538e9bdebe7ae2fa11/64ee69310bb55f013bd361a7_Amplitude%20Logo.svg"
                    alt="Amplitude"
                    className="h-6 inline-block align-middle"
                  />
                  {' '}events for you.
                </p>
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
            {/* Left Column: Input & Chat */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex-none">
                <InputSection 
                  description={inputDescription}
                  setDescription={setInputDescription}
                  imagePreview={inputImage}
                  setImagePreview={setInputImage}
                  onGenerate={handleGenerate} 
                  isGenerating={appState === AppState.GENERATING} 
                />
              </div>
              <div className="flex-1 min-h-0">
                 <ChatInterface 
                   messages={chatHistory} 
                   onSendMessage={handleChat}
                   isProcessing={appState === AppState.REFINING}
                 />
              </div>
            </div>

            {/* Right Column: Table */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
               <div className="flex-1 min-h-0">
                  <EventTable events={events} isLoading={appState === AppState.GENERATING || appState === AppState.REFINING} />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}