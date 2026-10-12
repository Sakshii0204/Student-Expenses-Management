import React from 'react';
import { DollarSign, Calendar, TrendingUp, TrendingDown, Award } from 'lucide-react';

export function KPICards({ summary = {} }) {
  const {
    totalSpent = 0,
    currentMonthSpent = 0,
    previousMonthSpent = 0,
    monthOverMonthChangePercent = 0,
    averageTransaction = 0,
    transactionCount = 0,
    highestCategory = { category: 'None', amount: 0 },
  } = summary;

  const isMoMDown = monthOverMonthChangePercent < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spent */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Recorded Spent</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">
            ${Number(totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Across {transactionCount} total transactions
          </p>
        </div>
      </div>

      {/* Current Month Spent */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">This Month's Spending</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">
            ${Number(currentMonthSpent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs mt-1">
            {monthOverMonthChangePercent !== 0 ? (
              <span
                className={`flex items-center font-semibold ${
                  isMoMDown ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {isMoMDown ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(monthOverMonthChangePercent)}%
              </span>
            ) : null}
            <span className="text-slate-500">vs prev month</span>
          </div>
        </div>
      </div>

      {/* Average Transaction */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Average Ticket</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">
            ${Number(averageTransaction).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mean per purchase
          </p>
        </div>
      </div>

      {/* Top Expense Category */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Top Expenditure</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-bold text-slate-900 truncate" title={highestCategory.category}>
            {highestCategory.category || 'None'}
          </h3>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            ${Number(highestCategory.amount).toFixed(2)} total
          </p>
        </div>
      </div>
    </div>
  );
}
