import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to local directory .env

// Verify critical security configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[SECURITY FATAL] JWT_SECRET is required. Refusing to boot with insecure fallback.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize single MongoDB connection pool
connectDB();

// Core Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev tools)
      if (!origin || origin === CLIENT_URL || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Unified Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: getDBStatus(),
      configured: Boolean(process.env.MONGODB_URI),
    },
    services: {
      auth: 'mounted (/api/auth)',
      expenses: 'mounted (/api/expenses)',
      analytics: 'mounted (/api/analytics)',
      budgets: 'mounted (/api/budgets)',
    },
  });
});

// Mount Unified API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);

// Catch-all 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Unified Server] Express backend running on http://localhost:${PORT}`);
  console.log(`[Unified Server] Health status at http://localhost:${PORT}/api/health`);
});

export { app, server };
export default app;
