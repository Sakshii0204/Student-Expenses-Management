import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';

export function RecentTransactionsTable({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Recent Transactions</h4>
        <p className="text-xs text-slate-400 mt-0.5">Transactions logged in Developer 2 will show up here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest expenditure entries</p>
        </div>
        <span className="text-xs font-mono text-slate-500">Last {transactions.length} entries</span>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((t) => {
          const dateStr = new Date(t.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={t._id || t.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.category}</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">
                    {t.description || 'No description'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 font-mono">
                  -${Number(t.amount).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{dateStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
