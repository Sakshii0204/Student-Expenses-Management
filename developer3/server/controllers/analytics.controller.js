import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';

function isDBReady() {
  return mongoose.connection.readyState === 1;
}

export async function getSummary(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Analytics cannot be computed.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Total spent and count
    const totalAgg = await Expense.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = totalAgg[0]?.totalSpent || 0;
    const count = totalAgg[0]?.count || 0;
    const averageTransaction = count > 0 ? parseFloat((totalSpent / count).toFixed(2)) : 0;

    // Current Month
    const currentMonthAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: currentMonthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const currentMonthSpent = currentMonthAgg[0]?.total || 0;

    // Previous Month
    const prevMonthAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: prevMonthStart, $lte: prevMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const previousMonthSpent = prevMonthAgg[0]?.total || 0;

    // Month-over-month calculation
    let momPercent = 0;
    if (previousMonthSpent > 0) {
      momPercent = ((currentMonthSpent - previousMonthSpent) / previousMonthSpent) * 100;
    } else if (currentMonthSpent > 0) {
      momPercent = 100;
    }

    // Top category
    const topCatAgg = await Expense.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);

    const highestCategory = topCatAgg[0]
      ? { category: topCatAgg[0]._id, amount: topCatAgg[0].total }
      : { category: 'None', amount: 0 };

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Analytics summary calculated from persistent records.',
      data: {
        totalSpent,
        transactionCount: count,
        averageTransaction,
        currentMonthSpent,
        previousMonthSpent,
        monthOverMonthChangePercent: parseFloat(momPercent.toFixed(1)),
        highestCategory,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to aggregate analytics summary.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getByCategory(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Database is not connected. Categorical breakdown unavailable.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const { timeframe = 'all' } = req.query;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const match = { user: userObjectId };

    if (timeframe === 'month') {
      const now = new Date();
      match.date = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (timeframe === 'year') {
      const now = new Date();
      match.date = { $gte: new Date(now.getFullYear(), 0, 1) };
    }

    const results = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = results.reduce((acc, curr) => acc + curr.total, 0);

    const formatted = results.map((item) => ({
      category: item._id,
      total: item.total,
      count: item.count,
      percentage: grandTotal > 0 ? parseFloat(((item.total / grandTotal) * 100).toFixed(1)) : 0,
    }));

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Category expenditure aggregated from persistent records.',
      data: {
        grandTotal,
        breakdown: formatted,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve category breakdown.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getMonthlyTrend(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Database is not connected. Monthly trend unavailable.',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const results = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trend = results.map((item) => {
      const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      return {
        yearMonth: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        label: monthLabel,
        total: item.total,
        count: item.count,
      };
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Monthly trend aggregated from persistent records.',
      data: { trend },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve monthly trend.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getRecentTransactions(req, res) {
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
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const recent = await Expense.find({ user: userObjectId })
      .sort({ date: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Recent transactions retrieved.',
      data: { transactions: recent },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to retrieve recent transactions.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
