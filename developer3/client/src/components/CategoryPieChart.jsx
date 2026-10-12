import React from 'react';
import { PieChart as PieIcon, PieChart, Layers } from 'lucide-react';

const PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#64748b', // Slate
];

export function CategoryPieChart({ breakdown = [], grandTotal = 0 }) {
  if (!breakdown || breakdown.length === 0 || grandTotal === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Category Data</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Record student expenses to generate an automated categorical breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Category Allocation</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution across spending pillars</p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          Total: ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Visual Proportion Bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 mb-6 shadow-inner">
        {breakdown.map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          return (
            <div
              key={item.category}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: color,
              }}
              title={`${item.category}: ${item.percentage}% ($${item.total.toFixed(2)})`}
              className="h-full transition-all duration-300 hover:opacity-85"
            />
          );
        })}
      </div>

      {/* Categorical Breakdown List */}
      <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
        {breakdown.map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          return (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-slate-800 truncate max-w-[160px]">
                  {item.category}
                </span>
                <span className="text-slate-400 font-mono">({item.count})</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-500">{item.percentage}%</span>
                <span className="font-semibold text-slate-900 w-16 text-right">
                  ${item.total.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
