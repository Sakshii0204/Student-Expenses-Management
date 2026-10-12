import { Router } from 'express';
import { getCurrentBudget, setMonthlyBudget } from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Secure all budget operations
router.use(protect);

router.get('/current', getCurrentBudget);
router.post('/', setMonthlyBudget);

export default router;
