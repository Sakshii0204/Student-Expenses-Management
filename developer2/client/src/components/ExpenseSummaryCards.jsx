import React from 'react';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';

export function ExpenseSummaryCards({ expenses = [] }) {
  const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered Spending</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entries Count</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{count}</h3>
        </div>
        <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Ticket</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ${average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
