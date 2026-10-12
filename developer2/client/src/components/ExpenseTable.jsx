import React from 'react';
import { Edit2, Trash2, Calendar, Tag, CreditCard, Inbox, AlertCircle } from 'lucide-react';

const CATEGORY_COLORS = {
  'Food & Groceries': 'bg-amber-50 text-amber-700 border-amber-200',
  'Housing & Rent': 'bg-blue-50 text-blue-700 border-blue-200',
  'Tuition & Books': 'bg-purple-50 text-purple-700 border-purple-200',
  'Transportation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Utilities & Bills': 'bg-teal-50 text-teal-700 border-teal-200',
  'Entertainment & Leisure': 'bg-pink-50 text-pink-700 border-pink-200',
  'Health & Personal Care': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Electronics & Gadgets': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Other': 'bg-slate-100 text-slate-700 border-slate-200',
};

export function ExpenseTable({
  expenses = [],
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onAddNew,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Fetching expenses from server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-rose-800">Failed to load expenses</h4>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">No expense records found</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          No expenses match the current filter criteria, or you haven't recorded any expenses yet.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
        >
          Add First Expense
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
            {expenses.map((expense) => {
              const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              const categoryBadge =
                CATEGORY_COLORS[expense.category] || 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <tr key={expense._id || expense.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryBadge}`}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {expense.description || <span className="text-slate-400 italic">No description</span>}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {expense.paymentMethod || 'Debit Card'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    ${Number(expense.amount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(expense)}
                        title="Edit expense"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense)}
                        title="Delete expense"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
