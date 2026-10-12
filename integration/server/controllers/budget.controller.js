import mongoose from 'mongoose';
import { Budget } from '../models/Budget.js';
import { Expense } from '../models/Expense.js';
import { calculateBudgetUtilization } from '../contracts/budget.contract.js';
function isDBReady() {
  return mongoose.connection.readyState === 1;
}

function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function getCurrentBudget(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Budget data unavailable.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetMonth = req.query.month || getCurrentMonthString();

    // Check month format
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(targetMonth)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid month format. Expected YYYY-MM.',
        timestamp: new Date().toISOString(),
      });
    }

    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    // Fetch budget and actual current month spending in parallel
    const [budgetDoc, spendingAgg] = await Promise.all([
      Budget.findOne({ user: userObjectId, month: targetMonth }),
      Expense.aggregate([
        {
          $match: {
            user: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const actualSpent = spendingAgg[0]?.totalSpent || 0;
    const expenseCount = spendingAgg[0]?.count || 0;
    const budgetAmount = budgetDoc ? budgetDoc.amount : 0;

    const calc = calculateBudgetUtilization(budgetAmount, actualSpent);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Budget metrics calculated from persistent records.',
      data: {
        hasBudget: Boolean(budgetDoc),
        month: targetMonth,
        budgetAmount: calc.budget,
        spentAmount: calc.spent,
        remainingAmount: calc.remaining,
        utilizationPercent: calc.utilization,
        status: calc.status,
        isWarning: calc.isWarning,
        isExceeded: calc.isExceeded,
        expenseCount,
        updatedAt: budgetDoc?.updatedAt || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve monthly budget.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function setMonthlyBudget(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Budget cannot be saved.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetMonth = req.body.month || getCurrentMonthString();
    const amountNum = parseFloat(req.body.amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Please provide a valid budget amount greater than $0.',
        timestamp: new Date().toISOString(),
      });
    }

    if (amountNum > 1000000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Budget amount exceeds maximum limit ($1,000,000).',
        timestamp: new Date().toISOString(),
      });
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(targetMonth)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid month format. Expected YYYY-MM.',
        timestamp: new Date().toISOString(),
      });
    }

    // Upsert budget
    const updatedBudget = await Budget.findOneAndUpdate(
      { user: userObjectId, month: targetMonth },
      { amount: amountNum },
      { new: true, upsert: true, runValidators: true }
    );

    // Compute active utilization
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    const spendingAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const actualSpent = spendingAgg[0]?.totalSpent || 0;
    const calc = calculateBudgetUtilization(updatedBudget.amount, actualSpent);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Monthly budget successfully saved to database.',
      data: {
        hasBudget: true,
        month: targetMonth,
        budgetAmount: calc.budget,
        spentAmount: calc.spent,
        remainingAmount: calc.remaining,
        utilizationPercent: calc.utilization,
        status: calc.status,
        isWarning: calc.isWarning,
        isExceeded: calc.isExceeded,
        updatedAt: updatedBudget.updatedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to persist monthly budget.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
