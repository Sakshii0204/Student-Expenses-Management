import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, ReceiptText } from 'lucide-react';
import { expenseApi } from '../services/expenseApi';
import { ExpenseTable } from '../components/ExpenseTable';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { ExpenseSummaryCards } from '../components/ExpenseSummaryCards';

export function ExpenseManagementPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    startDate: '',
    endDate: '',
    sort: 'date_desc',
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expenseApi.getExpenses(filters);
      if (response.success && response.data) {
        setExpenses(response.data.expenses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to expense service.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle Create / Update
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

  // Handle Delete
  async function handleConfirmDelete() {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await expenseApi.deleteExpense(deletingExpense._id || deletingExpense.id);
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
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
            <ReceiptText className="w-7 h-7 text-emerald-600" />
            Student Expense Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, filter, and audit personal spending with strict student ownership
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <ExpenseSummaryCards expenses={expenses} />

      {/* Filter Toolbar */}
      <ExpenseFilters filters={filters} onFilterChange={setFilters} />

      {/* Expense Data Table */}
      <ExpenseTable
        expenses={expenses}
        loading={loading}
        error={error}
        onEdit={(exp) => {
          setEditingExpense(exp);
          setIsFormOpen(true);
        }}
        onDelete={(exp) => setDeletingExpense(exp)}
        onAddNew={() => {
          setEditingExpense(null);
          setIsFormOpen(true);
        }}
      />

      {/* Add / Edit Form Modal */}
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
