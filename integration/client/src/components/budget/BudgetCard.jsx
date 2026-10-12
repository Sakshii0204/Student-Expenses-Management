import React, { useState } from 'react';
import { Target, AlertTriangle, AlertCircle, CheckCircle2, Edit3, X, Check } from 'lucide-react';
import { budgetApi } from '../../services/api';

export function BudgetCard({ budgetData, onBudgetUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!budgetData) return null;

  const {
    hasBudget = false,
    budgetAmount = 0,
    spentAmount = 0,
    remainingAmount = 0,
    utilizationPercent = 0,
    status = 'normal',
    isWarning = false,
    isExceeded = false,
    month = '',
  } = budgetData;

  async function handleSaveBudget(e) {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid budget greater than $0.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await budgetApi.setMonthlyBudget({ amount: val, month });
      if (res.success) {
        setIsEditing(false);
        setBudgetInput('');
        onBudgetUpdated();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save monthly budget.');
    } finally {
      setSubmitting(false);
    }
  }

  // Determine progress bar styling
  let progressColor = 'bg-emerald-600';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'Within Budget';

  if (isExceeded) {
    progressColor = 'bg-rose-600';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = 'Budget Exceeded';
  } else if (isWarning) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = '80% Threshold Alert';
  }

  const cappedBarPercent = Math.min(100, Math.max(0, utilizationPercent));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Monthly Spending Target
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Month: {month || 'Current'}
            </p>
          </div>
        </div>

        {hasBudget && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}
            >
              {isExceeded ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : isWarning ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{statusText}</span>
            </span>

            <button
              onClick={() => {
                setBudgetInput(String(budgetAmount));
                setIsEditing(true);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Edit monthly budget"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* When no budget is set */}
      {!hasBudget && !isEditing && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center">
          <p className="text-xs font-medium text-slate-600 mb-3">
            No spending budget configured for this month. Set a target to enable threshold alerts.
          </p>
          <button
            onClick={() => {
              setBudgetInput('500');
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Set Monthly Budget</span>
          </button>
        </div>
      )}

      {/* Inline edit form */}
      {isEditing && (
        <form onSubmit={handleSaveBudget} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold">
                $
              </span>
              <input
                type="number"
                step="1"
                min="1"
                max="1000000"
                required
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Target Amount (e.g. 750)"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setErrorMsg('');
              }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Budget metrics and bar when active */}
      {hasBudget && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Budget
              </span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                ${Number(budgetAmount).toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Current Spend
              </span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                ${Number(spentAmount).toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Remaining
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  isExceeded ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                ${Number(remainingAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Utilization</span>
              <span className="font-mono">{utilizationPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                style={{ width: `${cappedBarPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              />
            </div>
          </div>

          {/* Descriptive Alert Message */}
          {isExceeded ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                You have exceeded this month's budget by{' '}
                <strong className="font-mono font-bold">
                  ${(spentAmount - budgetAmount).toFixed(2)}
                </strong>.
              </span>
            </div>
          ) : isWarning ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Warning: You have reached {utilizationPercent}% of your monthly allowance.
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
