import express from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import { authenticateWallet } from '../middleware/auth.js';

const router = express.Router();

router.post('/connect-wallet', async (req, res, next) => {
  try {
    const { walletAddress, stakeAddress, signature } = req.body;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }


    const token = jwt.sign(
      { 
        walletAddress, 
        stakeAddress: stakeAddress || null 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      walletAddress,
      expiresIn: '24h'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user info
router.get('/me', authenticateWallet, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Verify token
router.post('/verify', authenticateWallet, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

export default router;
