/**
 * Analytics and Reporting Contract
 * Dictates summary and aggregate payload shapes for Developer 3.
 */

export const AnalyticsTimeframes = ['month', 'year', 'all', 'custom'];

/**
 * Expected shape of /api/analytics/summary
 */
export const SummaryPayloadShape = {
  totalSpent: 0,
  transactionCount: 0,
  averageTransaction: 0,
  currentMonthSpent: 0,
  previousMonthSpent: 0,
  monthOverMonthChangePercent: 0,
  highestCategory: {
    category: '',
    amount: 0,
  },
};

/**
 * Expected shape of /api/analytics/by-category
 * Array of { category: string, total: number, count: number, percentage: number }
 */

/**
 * Expected shape of /api/analytics/monthly-trend
 * Array of { yearMonth: string, label: string, total: number, count: number }
 */
