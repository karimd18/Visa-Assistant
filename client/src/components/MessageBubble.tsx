import React, { useState } from 'react';
import { MessageType, VisaRequirementType } from '../types';
import { FileText } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

interface MessageBubbleProps {
  message: MessageType;
  visaRequirement?: VisaRequirementType;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, visaRequirement }) => {
  const { content, isUser, file } = message;
  const [showImagePreview, setShowImagePreview] = useState(false);

  const containerClasses = isUser 
    ? "flex justify-end mb-4" 
    : "flex justify-start mb-4";
  
  const bubbleClasses = isUser
    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl py-3 px-4 max-w-[80%] shadow-lg relative before:absolute before:inset-0 before:bg-white/10 before:rounded-2xl before:opacity-0 hover:before:opacity-100 before:transition-opacity"
    : "bg-[#111111] text-gray-50 rounded-2xl py-3 px-4 max-w-[80%] shadow-lg border border-[#1A1A1A] relative before:absolute before:inset-0 before:bg-white/5 before:rounded-2xl before:opacity-0 hover:before:opacity-100 before:transition-opacity";

  const renderFileAttachment = () => {
    if (!file) return null;
    
    const isImage = file.type.startsWith('image/');
    
    return (
      <button
        onClick={() => isImage && setShowImagePreview(true)}
        className={`flex items-center mt-2 p-2 bg-[#0A0A0A]/80 rounded-lg border border-[#1A1A1A] w-full text-left transition-all ${
          isImage ? 'hover:bg-[#1A1A1A] hover:scale-[1.02] cursor-pointer' : ''
        }`}
      >
        <FileText className="h-4 w-4 mr-2" />
        <span className="text-sm truncate">{file.name}</span>
      </button>
    );
  };

  const renderVisaRequirement = () => {
    if (!visaRequirement) return null;
    
    let statusClasses = '';
    switch(visaRequirement) {
      case 'VISA EXEMPT':
        statusClasses = 'bg-green-950/50 text-green-400 border-green-900/50 before:bg-green-500/5';
        break;
      case 'VISA ON ARRIVAL':
        statusClasses = 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50 before:bg-yellow-500/5';
        break;
      case 'APPLY FOR VISA OFFLINE':
        statusClasses = 'bg-red-950/50 text-red-400 border-red-900/50 before:bg-red-500/5';
        break;
    }
    
    return (
      <div className={`mt-3 p-3 rounded-lg border ${statusClasses} font-medium relative before:absolute before:inset-0 before:rounded-lg hover:before:opacity-100 before:transition-opacity before:opacity-0`}>
        {visaRequirement}
      </div>
    );
  };

  return (
    <>
      <div className={containerClasses}>
        <div className={bubbleClasses}>
          <div className="relative z-10">
            <div className="whitespace-pre-wrap break-words">{content}</div>
            {renderFileAttachment()}
            {renderVisaRequirement()}
          </div>
        </div>
      </div>
      
      {showImagePreview && file && (
        <ImagePreviewModal
          file={file}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};

export default MessageBubble