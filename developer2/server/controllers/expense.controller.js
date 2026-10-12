import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';
import { validateExpenseInput } from '../validators/expense.validator.js';

function isDBReady() {
  return mongoose.connection.readyState === 1;
}

/**
 * Sanitize strings for CSV to prevent Formula Injection (CSV Injection)
 */
function sanitizeCSVField(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // If first char is dangerous formula trigger, prefix with apostrophe
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape internal double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Build Mongoose query filter from request parameters
 */
function buildExpenseFilter(userId, query) {
  const filter = { user: new mongoose.Types.ObjectId(userId) };

  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }

  if (query.search && query.search.trim()) {
    filter.description = { $regex: query.search.trim(), $options: 'i' };
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return filter;
}

export async function createExpense(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Expense cannot be created.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const validation = validateExpenseInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid expense input.',
        errors: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const { amount, category, date, description, paymentMethod } = req.body;

    const expense = await Expense.create({
      user: userId,
      amount: Number(amount),
      category,
      date: new Date(date),
      description: description ? description.trim() : '',
      paymentMethod: paymentMethod || 'Debit Card',
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Expense created and persisted successfully.',
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to persist expense record.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getExpenses(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Cannot retrieve persistent expense records.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const { sort = 'date_desc', page = 1, limit = 10 } = req.query;

    const filter = buildExpenseFilter(userId, req.query);

    let sortOption = { date: -1, _id: -1 };
    if (sort === 'date_asc') sortOption = { date: 1, _id: 1 };
    else if (sort === 'amount_desc') sortOption = { amount: -1, _id: -1 };
    else if (sort === 'amount_asc') sortOption = { amount: 1, _id: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(filter),
      Expense.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expenses retrieved successfully.',
      data: {
        count: expenses.length,
        expenses,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve expenses.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getExpenseById(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Database is not connected.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid expense identifier format.',
        timestamp: new Date().toISOString(),
      });
    }

    const expense = await Expense.findOne({ _id: id, user: userId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Expense record not found or access unauthorized.',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expense record retrieved.',
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve expense item.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function updateExpense(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Update cannot be persisted.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid expense identifier format.',
        timestamp: new Date().toISOString(),
      });
    }

    const validation = validateExpenseInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation failed for update data.',
        errors: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const { amount, category, date, description, paymentMethod } = req.body;

    const updated = await Expense.findOneAndUpdate(
      { _id: id, user: userId },
      {
        amount: Number(amount),
        category,
        date: new Date(date),
        description: description ? description.trim() : '',
        paymentMethod: paymentMethod || 'Debit Card',
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Expense record not found or access unauthorized.',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expense record successfully updated in database.',
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to update expense item.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function deleteExpense(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Delete cannot proceed.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid expense identifier format.',
        timestamp: new Date().toISOString(),
      });
    }

    const deleted = await Expense.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Expense record not found or access unauthorized.',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expense record permanently deleted from database.',
      data: { id },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to delete expense item.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Export filtered expenses as RFC 4180 compliant CSV
 * Strictly scoped to authenticated student
 */
export async function exportExpensesCSV(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Cannot generate export.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const filter = buildExpenseFilter(userId, req.query);

    const expenses = await Expense.find(filter).sort({ date: -1 });

    const headers = ['Date', 'Category', 'Amount (USD)', 'Description', 'Payment Method', 'Record ID'];
    const rows = expenses.map((e) => {
      const dateFormatted = new Date(e.date).toISOString().split('T')[0];
      return [
        sanitizeCSVField(dateFormatted),
        sanitizeCSVField(e.category),
        sanitizeCSVField(Number(e.amount).toFixed(2)),
        sanitizeCSVField(e.description || ''),
        sanitizeCSVField(e.paymentMethod || 'Debit Card'),
        sanitizeCSVField(e._id.toString()),
      ].join(',');
    });

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `student-expenses-${dateStamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to generate CSV export.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
