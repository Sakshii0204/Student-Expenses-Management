import React from 'react';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { LineChart } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <LineChart className="w-5 h-5" />
            </div>
            <span>Student Expense <span className="text-emerald-400">Analytics</span></span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Developer 3 — Analytics & Reports
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnalyticsDashboardPage />
      </main>
    </div>
  );
}

export default App;
