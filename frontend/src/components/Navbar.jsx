import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { healthService } from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        await healthService.check();
        if (isMounted) setDbStatus('connected');
      } catch (err) {
        if (isMounted) setDbStatus('disconnected');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Student Attendance System
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              MERN Stack Academic Management Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Today's date badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{todayDateFormatted}</span>
          </div>

          {/* Database status pill */}
          <div
            title={`MongoDB Server Status: ${dbStatus}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
              dbStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : dbStatus === 'disconnected'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {dbStatus === 'connected'
                ? 'DB Connected'
                : dbStatus === 'disconnected'
                ? 'DB Disconnected'
                : 'Connecting...'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected'
                  ? 'bg-emerald-500'
                  : dbStatus === 'disconnected'
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

