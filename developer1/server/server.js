import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
connectDB();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'Developer 1 - Auth & Security',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Developer 1: Auth Server] listening on http://localhost:${PORT}`);
});

export default app;
