import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Layers, Calendar, DollarSign } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { TimeframeSelector } from '../components/TimeframeSelector';
export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryData, setCategoryData] = useState({ grandTotal: 0, breakdown: [] });
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [timeframe, setTimeframe] = useState('all');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, trendRes, sumRes] = await Promise.all([
        analyticsApi.getByCategory(timeframe).catch((e) => {
          if (e.status === 503) throw e;
          return { data: { grandTotal: 0, breakdown: [] } };
        }),
        analyticsApi.getMonthlyTrend().catch((e) => {
          if (e.status === 503) throw e;
          return { data: { trend: [] } };
        }),
        analyticsApi.getSummary().catch((e) => {
          if (e.status === 503) throw e;
          return { data: {} };
        }),
      ]);

      setCategoryData(catRes.data || { grandTotal: 0, breakdown: [] });
      setTrendData(trendRes.data?.trend || []);
      setSummary(sumRes.data || {});
    } catch (err) {
      setError(err.message || 'Failed to generate financial reports.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            Financial Intelligence & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Categorical allocation, monthly trajectory, and detailed student expenditure audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
          <button
            onClick={fetchReports}
            title="Refresh reports"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <Layers className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          breakdown={categoryData.breakdown}
          grandTotal={categoryData.grandTotal}
        />
        <MonthlyTrendChart trend={trendData} />
      </div>

      {/* Detailed Categorical Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Categorical Breakdown Audit
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {categoryData.breakdown?.length || 0} active categories
          </span>
        </div>

        {categoryData.breakdown && categoryData.breakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6 text-center">Transactions</th>
                  <th className="py-3 px-6 text-right">Proportion</th>
                  <th className="py-3 px-6 text-right">Total Spent</th>
                  <th className="py-3 px-6 text-right">Avg / Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryData.breakdown.map((item) => {
                  const avg = item.count > 0 ? item.total / item.count : 0;

                  return (
                    <tr key={item.category} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono text-xs text-slate-600">
                        {item.count}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900 font-mono">
                        ${Number(item.total).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-xs text-slate-500">
                        ${Number(avg).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No expenses recorded yet to generate audit report.
          </div>
        )}
      </div>
    </div>
  );
}
