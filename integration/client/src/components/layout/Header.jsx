import React from 'react';
import { Menu, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function Header({ onOpenMobile = () => {}, onQuickAddExpense = null }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Student Session
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-500">
            {user?.college || 'Academic Account'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/transactions"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Expense</span>
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-2 pl-3 border-l border-slate-200 text-slate-700 hover:text-slate-900 transition"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="hidden md:inline text-xs font-semibold">{user?.name}</span>
        </Link>
      </div>
    </header>
  );
}
