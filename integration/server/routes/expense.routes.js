import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  exportExpensesCSV,
} from '../../../developer2/server/controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Enforce authentication on all expense endpoints
router.use(protect);

router.get('/export/csv', exportExpensesCSV);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
