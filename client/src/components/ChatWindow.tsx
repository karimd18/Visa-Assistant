import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { MessageType, VisaRequirementType } from '../types';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
  visaRequirement: VisaRequirementType;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, visaRequirement }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0A] px-4">
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <MessageBubble 
              message={message} 
              visaRequirement={index === messages.length - 1 && !message.isUser ? visaRequirement : undefined}
            />
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#111111] rounded-lg p-3">
              <LoadingSpinner />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow