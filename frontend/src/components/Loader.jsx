import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500"
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-8 text-slate-500"
    >
      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Loader;
