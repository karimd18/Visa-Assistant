import React, { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null as any);
  };

  const acceptedFileTypes = '.jpg,.jpeg,.png,.pdf';

  return (
    <div className="flex items-center">
      {!file ? (
        <button
          type="button"
          onClick={handleClick}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors duration-200 relative group"
          aria-label="Upload passport"
          title="Upload passport (JPEG, PNG, PDF)"
        >
          <Paperclip className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            className="hidden"
          />
        </button>
      ) : (
        <div className="flex items-center gap-2 py-1.5 px-3 bg-[#1A1A1A] rounded-lg border border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
              <Paperclip className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-300 truncate max-w-[120px]">
              {file.name}
            </span>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1 hover:bg-[#222222] rounded transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;