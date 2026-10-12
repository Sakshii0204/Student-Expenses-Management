import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, RefreshCw, FileDown, AlertCircle } from 'lucide-react';
import { expenseApi } from '../services/api';
import { ExpenseTable } from '../../../../developer2/client/src/components/ExpenseTable';
import { ExpenseFormModal } from '../../../../developer2/client/src/components/ExpenseFormModal';
import { DeleteConfirmModal } from '../../../../developer2/client/src/components/DeleteConfirmModal';
import { ExpenseFilters } from '../../../../developer2/client/src/components/ExpenseFilters';
import { ExpenseSummaryCards } from '../../../../developer2/client/src/components/ExpenseSummaryCards';
import { Pagination } from '../components/common/Pagination';

export function TransactionsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Export State
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportError, setExportError] = useState('');

  // Filter toolbar state
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    startDate: '',
    endDate: '',
    sort: 'date_desc',
  });

  // Modal dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expenseApi.getExpenses({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success && response.data) {
        setExpenses(response.data.expenses || []);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
            page: response.data.pagination.page,
          }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve expenses from server.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    // Reset to page 1 on filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(newPage) {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }

  async function handleExportCSV() {
    setExportingCSV(true);
    setExportError('');
    try {
      await expenseApi.downloadCSV(filters);
    } catch (err) {
      setExportError(err.message || 'Failed to generate CSV export.');
    } finally {
      setExportingCSV(false);
    }
  }

  async function handleSaveExpense(payload) {
    if (editingExpense) {
      const res = await expenseApi.updateExpense(editingExpense._id || editingExpense.id, payload);
      if (res.success) {
        fetchExpenses();
      }
    } else {
      const res = await expenseApi.createExpense(payload);
      if (res.success) {
        fetchExpenses();
      }
    }
  }

  async function handleConfirmDelete() {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await expenseApi.deleteExpense(deletingExpense._id || deletingExpense.id);
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      alert(`Delete operation failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-600" />
            Expense Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete student spending records, categories, and payment receipts
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* CSV Export Action */}
          <button
            onClick={handleExportCSV}
            disabled={exportingCSV || loading}
            title="Download CSV export matching current filters"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
          >
            {exportingCSV ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-slate-600" />
            )}
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchExpenses}
            title="Refresh records"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Summary KPI Cards for active query */}
      <ExpenseSummaryCards expenses={expenses} />

      {/* Query Filters */}
      <ExpenseFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Main Expense Table with integrated pagination */}
      <div className="space-y-0">
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          error={error}
          onEdit={(item) => {
            setEditingExpense(item);
            setIsFormOpen(true);
          }}
          onDelete={(item) => setDeletingExpense(item)}
          onAddNew={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
        />

        {/* Server-Side Pagination Controls */}
        {!loading && !error && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        expense={deletingExpense}
        isDeleting={isDeleting}
      />
    </div>
  );
}
