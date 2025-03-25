import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface AlertProps {
  message: string;
}

export function Alert({ message }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 p-4 w-[90%] max-w-lg shadow-xl rounded-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 p-2 rounded-full backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-white/90 font-medium">{message}</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}