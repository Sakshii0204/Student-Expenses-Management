/**
 * Monthly Budget Contract
 * Governs student monthly spending budgets and threshold alerts.
 */

export const BudgetThresholds = {
  WARNING_PERCENT: 80,
  EXCEEDED_PERCENT: 100,
};

export const BudgetValidation = {
  amount: {
    min: 1.0,
    max: 1000000.0,
    required: true,
  },
  monthPattern: /^\d{4}-(0[1-9]|1[0-2])$/, // YYYY-MM
};

/**
 * Calculate budget status from spending
 * @param {number} budgetAmount
 * @param {number} spentAmount
 */
export function calculateBudgetUtilization(budgetAmount = 0, spentAmount = 0) {
  const budget = Number(budgetAmount) || 0;
  const spent = Number(spentAmount) || 0;

  const remaining = Math.max(0, budget - spent);
  const utilization = budget > 0 ? parseFloat(((spent / budget) * 100).toFixed(1)) : 0;

  let status = 'normal';
  if (budget > 0) {
    if (spent >= budget) {
      status = 'exceeded';
    } else if (utilization >= BudgetThresholds.WARNING_PERCENT) {
      status = 'warning';
    }
  }

  return {
    budget,
    spent,
    remaining,
    utilization,
    status,
    isWarning: status === 'warning',
    isExceeded: status === 'exceeded',
  };
}
