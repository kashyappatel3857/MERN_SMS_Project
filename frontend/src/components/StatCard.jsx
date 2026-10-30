import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    ring: 'focus:ring-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    ring: 'focus:ring-emerald-500',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    ring: 'focus:ring-rose-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    ring: 'focus:ring-indigo-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    ring: 'focus:ring-amber-500',
  },
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${style.bg} ${style.text} border ${style.border}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

