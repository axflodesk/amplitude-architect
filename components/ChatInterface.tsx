import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-xl overflow-hidden">
      <div className="p-4 bg-secondary">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Assistant
        </h3>
        <p className="text-xs text-primary/70 mt-1">Chat to refine or add events.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-primary/40 text-sm py-8">
            <p>Tell me what to change in the table.</p>
            <p className="mt-2 text-xs">Example: "Add a hover event for the tooltip"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-page text-primary'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
              ${msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-page border border-transparent text-primary rounded-bl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3 flex-row">
             <div className="w-8 h-8 rounded-full bg-page text-primary flex items-center justify-center flex-shrink-0">
               <Bot size={14} />
             </div>
             <div className="bg-page border border-transparent text-primary rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
               <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-secondary">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your feedback..."
            className="flex-1 px-4 py-2 border border-primary/10 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm transition-all placeholder:text-primary/40 text-primary"
            disabled={isProcessing}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};