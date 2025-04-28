import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  file: File;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ file, onClose }) => {
  const imageUrl = URL.createObjectURL(file);

  React.useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative max-w-4xl w-full bg-[#111111] rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-[#222222] text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-2">{file.name}</h3>
          <div className="aspect-auto max-h-[80vh] overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={file.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;