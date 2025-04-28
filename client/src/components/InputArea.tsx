import React, { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (content: string, file?: File | null) => void;
  disabled?: boolean;
  className?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false, className = '' }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() || file) {
      onSendMessage(message, file);
      setMessage('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${className} space-y-2`}
    >
      {file && (
        <div className="flex items-center gap-2 py-2 px-3 bg-[#1A1A1A] rounded-lg border border-[#222222] w-fit">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
              <Paperclip className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-300 truncate max-w-[120px]">
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 hover:bg-[#222222] rounded transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
          </button>
        </div>
      )}
      
      <div className="flex items-end rounded-lg border border-[#1A1A1A] bg-[#111111] shadow-xl focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-transparent overflow-hidden">
        <textarea
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about visa requirements..."
          className="w-full resize-none py-4 px-4 outline-none min-h-[56px] max-h-[200px] bg-transparent text-gray-50 placeholder-gray-500"
          disabled={disabled}
        />
        
        <div className="flex items-center px-3 py-2 space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors duration-200 relative group"
            aria-label="Upload passport"
            title="Upload passport (JPEG, PNG, PDF)"
          >
            <Paperclip className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
          </button>
          
          <button
            type="submit"
            disabled={disabled || (!message.trim() && !file)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              disabled || (!message.trim() && !file)
                ? 'bg-[#1A1A1A] text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputArea;