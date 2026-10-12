import React from 'react';
import { Search, Filter, ArrowUpDown, Calendar } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Food & Groceries',
  'Housing & Rent',
  'Tuition & Books',
  'Transportation',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Health & Personal Care',
  'Electronics & Gadgets',
  'Other',
];

export function ExpenseFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>
    </div>
  );
}
