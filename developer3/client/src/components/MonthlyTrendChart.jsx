import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export function MonthlyTrendChart({ trend = [] }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Monthly History</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Historical trend data will render as expenses are logged across calendar months.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...trend.map((t) => t.total), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Monthly Trajectory</h3>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated spending velocity (last 6 months)</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active Trend</span>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 border-b border-slate-100 px-2">
        {trend.map((point) => {
          const heightPercent = Math.max((point.total / maxVal) * 100, 4);

          return (
            <div key={point.yearMonth} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${Number(point.total).toFixed(0)}
              </span>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full max-w-[42px] bg-slate-900 group-hover:bg-emerald-600 rounded-t-md transition-all duration-300 relative"
              />
              <span className="text-[11px] font-medium text-slate-600 mt-2 truncate w-full text-center">
                {point.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
        <span>Historical Aggregation</span>
        <span className="font-mono">Peak: ${maxVal.toFixed(2)}</span>
      </div>
    </div>
  );
}
