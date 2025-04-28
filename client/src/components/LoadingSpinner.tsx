import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex space-x-1 justify-center items-center h-4 my-1">
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite] opacity-80 
        transition-all duration-300" style={{ animationDelay: '0.1s' }}></div>
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite] opacity-90
        transition-all duration-300" style={{ animationDelay: '0.2s' }}></div>
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite] opacity-80
        transition-all duration-300" style={{ animationDelay: '0.3s' }}></div>
    </div>
  );
};

export default LoadingSpinner;