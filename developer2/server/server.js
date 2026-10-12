import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import expenseRoutes from './routes/expense.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Database connection
connectDB();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'Developer 2 - Expense Management',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/expenses', expenseRoutes);

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Developer 2: Expense Server] running on http://localhost:${PORT}`);
});

export default app;
