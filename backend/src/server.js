import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import savingsRoutes from './routes/savings.js';
import loanRoutes from './routes/loan.js';
import investmentRoutes from './routes/investment.js';
import rewardsRoutes from './routes/rewards.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: process.env.BLOCKFROST_NETWORK || 'preview'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/rewards', rewardsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Safe-Save Backend running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.BLOCKFROST_NETWORK || 'preprod'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
