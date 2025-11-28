import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { IconX } from './icons';

interface SystemPromptPopoverProps {
  children?: ReactNode;
}

export const SystemPromptPopover: React.FC<SystemPromptPopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const systemPrompt = `You are an expert Product Manager and Data Analyst specializing in Amplitude instrumentation.
Your goal is to generate precise, consistent, and useful tracking events for software applications.

Format Guidelines:
- **Action**: Human readable description of the user action.
- **View**: 'view:<page_name>'
- **Click**: 'click:<element_name>' (if applicable) or other action verb.
- **Event name**: combined scope usually 'view:<page>:click:<element>'
- **Event properties**: List key-value pairs or property descriptions clearly. E.g., "Plan: [Free, Pro], Source: [Header, Footer]"

Analyze the inputs (images and text) to determine the necessary events to track user interaction fully.`;

  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 640; // w-[640px]
      const popoverHeight = popoverRef.current.offsetHeight;

      let left = triggerRect.right - popoverWidth;
      let top = triggerRect.bottom + 8;

      // Ensure popover doesn't go off-screen to the left
      if (left < 8) {
        left = 8;
      }

      // Ensure popover doesn't go off-screen to the right
      if (left + popoverWidth > window.innerWidth - 8) {
        left = window.innerWidth - popoverWidth - 8;
      }

      // Ensure popover doesn't go off-screen at the bottom
      if (top + popoverHeight > window.innerHeight - 8) {
        top = triggerRect.top - popoverHeight - 8;
      }

      setPosition({
        top,
        left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={children ? "hover:opacity-70 transition-opacity cursor-pointer" : "px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer"}
        style={children ? {} : {
          backgroundColor: '#2B2B2B',
          color: '#f5f5f5',
        }}
      >
        {children || "Gemini 3 Pro"}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[60] shadow-2xl p-5"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: '640px',
            backgroundColor: '#2B2B2B',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: '#f5f5f5' }}>System prompt</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-gray-300 transition-colors"
              style={{ color: '#f5f5f5' }}
            >
              <IconX width={16} height={16} />
            </button>
          </div>

          {/* Code Block */}
          <div className="p-4 font-mono text-xs leading-relaxed text-gray-300" style={{ backgroundColor: '#1a1a1a' }}>
            <pre className="whitespace-pre-wrap break-words">{systemPrompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
