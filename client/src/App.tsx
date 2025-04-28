import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import { useChatState } from './hooks/useChatState';
import './index.css';

const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

function App() {
  const { messages, isLoading, visaRequirement, sendMessage } = useChatState();
  const [hasStartedChat, setHasStartedChat] = useState(false);

  useEffect(() => {
    if (messages.length > 0 && !hasStartedChat) {
      setHasStartedChat(true);
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <style>{animationStyles}</style>
      <Header />
      
      <main className={`flex-1 overflow-hidden ${hasStartedChat ? 'pt-[60px]' : ''} flex flex-col relative`}>
        {hasStartedChat ? (
          <>
            <ChatWindow 
              messages={messages} 
              isLoading={isLoading} 
              visaRequirement={visaRequirement}
            />
            <div className="sticky bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
              <div className="max-w-3xl mx-auto px-4">
                <InputArea 
                  onSendMessage={sendMessage} 
                  disabled={isLoading}
                  className="bg-transparent"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl animate-fade-in">
              <h1 className="text-4xl font-bold text-gray-50 text-center mb-4 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Welcome to Visa Assistant
              </h1>
              <p className="text-gray-400 text-center mb-12 text-lg">
                Tell me your passport country and where you'd like to travel
              </p>
              <InputArea 
                onSendMessage={sendMessage} 
                disabled={isLoading}
                className="bg-transparent"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App