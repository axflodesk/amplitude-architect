import React, { useState, useEffect, useRef } from 'react';
import { IconCoffee, IconCoffee1, IconCoffee2, IconCoffee3, IconRobot, IconUser, IconStar } from './icons';
import { ChatMessage } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [coffeeFrame, setCoffeeFrame] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCoffeeFrame(prev => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
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
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="flex-shrink-0 text-primary">
              {msg.role === 'user' ? <IconUser width={20} height={20} /> : <IconRobot width={20} height={20} />}
            </div>
            <div className={`
              max-w-[85%] px-4 py-2.5 text-sm shadow-sm
              ${msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-page border border-transparent text-primary'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3 flex-row">
             <div className="flex-shrink-0 text-primary">
               <IconRobot width={20} height={20} />
             </div>
             <div className="bg-page border border-transparent text-primary px-4 py-3 shadow-sm flex items-center gap-2">
               {coffeeFrame === 0 && <IconCoffee3 width={20} height={20} />}
               {coffeeFrame === 1 && <IconCoffee2 width={20} height={20} />}
               {coffeeFrame === 2 && <IconCoffee1 width={20} height={20} />}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-secondary">
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
      </div>
    </div>
  );
};