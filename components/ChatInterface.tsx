import React, { useState, useEffect, useRef } from 'react';
import { IconCoffee, IconRobot, IconUser, IconStar, IconX, IconStop } from './icons';
import { ChatMessage } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onStopProcessing?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing, onStopProcessing }) => {
  const [input, setInput] = useState('');
  const [processingMessage, setProcessingMessage] = useState('Processing');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processingMessages = ['Processing', 'Crunching', 'Analyzing'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isProcessing) {
      setElapsedTime(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) {
      setProcessingMessage('Processing');
      return;
    }

    let state = {
      messageIndex: 0,
      charIndex: 0,
      isDeleting: false,
      isPaused: false,
      pauseTimer: null as NodeJS.Timeout | null
    };

    const updateAnimation = () => {
      if (state.isPaused) return;

      const currentMessage = processingMessages[state.messageIndex];

      if (!state.isDeleting) {
        // Typing phase
        if (state.charIndex < currentMessage.length) {
          setProcessingMessage(currentMessage.slice(0, state.charIndex + 1) + '...');
          state.charIndex++;
        } else {
          // Start pause before deleting
          state.isPaused = true;
          state.pauseTimer = setTimeout(() => {
            state.isPaused = false;
            state.isDeleting = true;
          }, 800);
        }
      } else {
        // Deleting phase - erase entire word at once
        state.isDeleting = false;
        state.messageIndex = (state.messageIndex + 1) % processingMessages.length;
        state.charIndex = 0;
      }
    };

    const interval = setInterval(updateAnimation, 100);

    return () => {
      clearInterval(interval);
      if (state.pauseTimer) clearTimeout(state.pauseTimer);
    };
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary overflow-hidden border-2 border-primary/80">
      <div className="p-4 bg-secondary">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <IconStar width={20} height={20} />
          AI assistant
        </h3>
        <p className="text-xs text-primary/70 mt-1">Chat to refine or add events</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-primary/40 text-sm py-8">
            <p>Tell me what to change in the table.</p>
            <p className="mt-2 text-xs">Example: "Add a hover event for the tooltip"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex-shrink-0 text-primary pt-1">
              {msg.role === 'user' ? <IconUser width={20} height={20} /> : <IconRobot width={20} height={20} />}
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
              {msg.imageData && msg.role === 'user' && (
                <img
                  src={msg.imageData}
                  alt="Feature snapshot"
                  className="max-w-full max-h-64 object-contain cursor-zoom-in"
                  onClick={() => { setSelectedImage(msg.imageData); setIsModalOpen(true); }}
                />
              )}
              <div className={`
                shadow-sm
                ${msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-page border border-transparent text-primary'}
              `}>
                <div className="px-4 py-2.5 text-sm">
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3 flex-row">
             <div className="flex-shrink-0 text-primary">
               <IconRobot width={20} height={20} />
             </div>
             <div className="bg-page border border-transparent text-primary px-4 py-3 shadow-sm font-mono text-sm">
               {processingMessage}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-secondary">
        {isProcessing ? (
          <div className="flex items-center justify-between text-xs text-primary/70">
            <span>Processing... {elapsedTime}s</span>
            <button
              onClick={onStopProcessing}
              className="p-2 hover:bg-primary/10 rounded transition-colors text-primary"
              title="Stop processing"
            >
              <IconStop width={16} height={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your feedback…"
              className="flex-1 px-4 py-3 pr-14 border border-primary/10 bg-gray-50 focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm transition-all placeholder:text-primary/40 text-primary"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isProcessing}
              className="absolute right-2"
            >
              <IconCoffee width={16} height={16} />
            </Button>
          </form>
        )}
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <IconX width={32} height={32} />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};