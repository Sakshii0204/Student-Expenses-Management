/**
 * Expense Entity and Validation Contract
 * Single source of truth for Developer 2 and Developer 3.
 */

export const ExpenseCategories = [
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

export const PaymentMethods = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'UPI / Mobile Transfer',
  'Bank Transfer',
];

export const ExpenseValidation = {
  amount: {
    min: 0.01,
    max: 1000000.0,
    required: true,
  },
  category: {
    allowed: ExpenseCategories,
    required: true,
  },
  description: {
    maxLength: 300,
    required: false,
  },
  date: {
    required: true,
  },
};

/**
 * Standard monetary formatting helper
 * Always store numbers with up to 2 decimal places in database.
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};
