import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, RefreshCw, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi, budgetApi } from '../services/api';
import { KPICards } from '../../../../developer3/client/src/components/KPICards';
import { CategoryPieChart } from '../../../../developer3/client/src/components/CategoryPieChart';
import { MonthlyTrendChart } from '../../../../developer3/client/src/components/MonthlyTrendChart';
import { RecentTransactionsTable } from '../../../../developer3/client/src/components/RecentTransactionsTable';
import { TimeframeSelector } from '../../../../developer3/client/src/components/TimeframeSelector';
import { BudgetCard } from '../components/budget/BudgetCard';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState({ grandTotal: 0, breakdown: [] });
  const [trendData, setTrendData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [timeframe, setTimeframe] = useState('all');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, trendRes, recentRes, budgetRes] = await Promise.all([
        analyticsApi.getSummary().catch((e) => {
          if (e.status === 503) throw e;
          return { data: {} };
        }),
        analyticsApi.getByCategory(timeframe).catch((e) => {
          if (e.status === 503) throw e;
          return { data: { grandTotal: 0, breakdown: [] } };
        }),
        analyticsApi.getMonthlyTrend().catch((e) => {
          if (e.status === 503) throw e;
          return { data: { trend: [] } };
        }),
        analyticsApi.getRecentTransactions(5).catch((e) => {
          if (e.status === 503) throw e;
          return { data: { transactions: [] } };
        }),
        budgetApi.getCurrentBudget().catch((e) => {
          if (e.status === 503) throw e;
          return { data: null };
        }),
      ]);

      setSummary(sumRes.data || {});
      setCategoryData(catRes.data || { grandTotal: 0, breakdown: [] });
      setTrendData(trendRes.data?.trend || []);
      setRecentTransactions(recentRes.data?.transactions || []);
      setBudgetData(budgetRes.data || null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve authoritative financial metrics.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-emerald-600" />
            Financial Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated expenditure metrics, monthly budget telemetry, and category velocity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
          <button
            onClick={loadDashboardData}
            title="Refresh metrics"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/transactions"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Budget Target & Alert Card */}
      <BudgetCard budgetData={budgetData} onBudgetUpdated={loadDashboardData} />

      {/* Headline KPI Cards */}
      <KPICards summary={summary || {}} />

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          breakdown={categoryData.breakdown}
          grandTotal={categoryData.grandTotal}
        />
        <MonthlyTrendChart trend={trendData} />
      </div>

      {/* Recent Activity Table with Link to Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">Recent Ledger Activity</h3>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RecentTransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
}
