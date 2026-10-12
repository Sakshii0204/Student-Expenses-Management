import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { analyticsApi } from '../services/analyticsApi';
import { KPICards } from '../components/KPICards';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { RecentTransactionsTable } from '../components/RecentTransactionsTable';
import { TimeframeSelector } from '../components/TimeframeSelector';

export function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState({ grandTotal: 0, breakdown: [] });
  const [trendData, setTrendData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [timeframe, setTimeframe] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, trendRes, recentRes] = await Promise.all([
        analyticsApi.getSummary().catch(() => ({ data: {} })),
        analyticsApi.getByCategory(timeframe).catch(() => ({ data: { grandTotal: 0, breakdown: [] } })),
        analyticsApi.getMonthlyTrend().catch(() => ({ data: { trend: [] } })),
        analyticsApi.getRecentTransactions(5).catch(() => ({ data: { transactions: [] } })),
      ]);

      setSummary(sumRes.data || {});
      setCategoryData(catRes.data || { grandTotal: 0, breakdown: [] });
      setTrendData(trendRes.data?.trend || []);
      setRecentTransactions(recentRes.data?.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve financial metrics.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            Financial Intelligence & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated expenditure metrics, categorical allocation, and trend telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
          <button
            onClick={fetchAnalytics}
            title="Refresh analytics"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Headline Cards */}
      <KPICards summary={summary || {}} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          breakdown={categoryData.breakdown}
          grandTotal={categoryData.grandTotal}
        />
        <MonthlyTrendChart trend={trendData} />
      </div>

      {/* Recent Transactions List */}
      <RecentTransactionsTable transactions={recentTransactions} />
    </div>
  );
}
