import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Loader;

