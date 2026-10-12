import React from 'react';

export function TimeframeSelector({ timeframe, onChange }) {
  const options = [
    { id: 'all', label: 'All Time' },
    { id: 'year', label: 'This Year' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
            timeframe === opt.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
