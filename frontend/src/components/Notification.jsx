import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  }[type] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: <Info className="w-5 h-5 text-slate-600 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg transition-all transform duration-300 max-w-md ${config.bg}`}
    >
      {config.icon}
      <span className="text-sm font-medium flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Notification;

