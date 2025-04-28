import React from 'react';
import { Globe2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#111111]/80 backdrop-blur-lg border-b border-[#222222] fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <div className="flex items-center">
          <div className="relative">
            <Globe2 className="h-6 w-6 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 h-6 w-6 bg-blue-500/20 animate-ping rounded-full" />
          </div>
          <h1 className="text-xl font-semibold text-gray-50 ml-3">Visa Assistant</h1>
        </div>
        <div className="ml-auto flex items-center space-x-3">
          <div className="flex items-center px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#222222]">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-400">Made by Karim Doueik</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;