
import { Router } from 'express';
import {
  getSummary,
  getByCategory,
  getMonthlyTrend,
  getRecentTransactions,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Enforce authentication on all analytics endpoints
router.use(protect);

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/recent', getRecentTransactions);

export default router;
