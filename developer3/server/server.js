import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Database connection
connectDB();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'Developer 3 - Analytics & Reports',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Developer 3: Analytics Server] running on http://localhost:${PORT}`);
});

export default app;
