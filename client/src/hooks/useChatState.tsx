import { useState, useCallback } from 'react';
import { MessageType, VisaRequirementType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { analyzeMessage } from '../lib/api';

export const useChatState = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visaRequirement, setVisaRequirement] = useState<VisaRequirementType>(null);
  const [passportCountry, setPassportCountry] = useState<string | null>(null);
  const [destinationCountry, setDestinationCountry] = useState<string | null>(null);

  const addMessage = useCallback((content: string, isUser: boolean, file?: File | null) => {
    const newMessage: MessageType = {
      id: uuidv4(),
      content,
      isUser,
      timestamp: new Date(),
      file,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(
    async (content: string, file?: File | null) => {
      addMessage(content, true, file);
      setIsLoading(true);

      try {
        const resp = await analyzeMessage(content, file);
        const {
          status,
          message: aiMessage,
          passportCountry: apiPassport,
          destinationCountry: apiDestination,
        } = resp;

        addMessage(aiMessage, false);

        setPassportCountry(apiPassport ?? null);
        setDestinationCountry(apiDestination ?? null);

        let requirement: VisaRequirementType = null;
        if (status === 'complete') {
          const msgLC = aiMessage.toLowerCase();
          if (msgLC.includes('exempt')) {
            requirement = 'VISA EXEMPT';
          } else if (msgLC.includes('arrival')) {
            requirement = 'VISA ON ARRIVAL';
          } else if (msgLC.includes('apply')) {
            requirement = 'APPLY FOR VISA OFFLINE';
          }
        } else {
          requirement = null;
        }
        setVisaRequirement(requirement);

      } catch (error) {
        console.error('Error processing message:', error);
        addMessage(
          "I apologize, but I encountered an error processing your request. Could you please try again?",
          false
        );
        setVisaRequirement(null);
        setPassportCountry(null);
        setDestinationCountry(null);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  return {
    messages,
    isLoading,
    visaRequirement,
    passportCountry,
    destinationCountry,
    sendMessage,
  };
};
