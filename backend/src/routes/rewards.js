import express from 'express';
import { authenticateWallet } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import blockfrostService from '../services/blockfrost.js';

const router = express.Router();

// Get user rewards/badges
router.get('/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const rewardsContractAddress = process.env.REWARDS_CONTRACT_ADDRESS;

    if (!rewardsContractAddress) {
      throw new AppError('Rewards contract address not configured', 500);
    }

    const assets = await blockfrostService.api.addressesAssets(walletAddress);
    
    const badges = assets
      .filter(asset => asset.unit.startsWith(rewardsContractAddress))
      .map(asset => ({
        assetId: asset.unit,
        quantity: asset.quantity,
        name: this.decodeBadgeName(asset.unit)
      }));

    res.json({
      success: true,
      badges,
      totalBadges: badges.length
    });
  } catch (error) {
    next(error);
  }
});

// Claim a badge
router.post('/claim/:badgeType', authenticateWallet, async (req, res, next) => {
  try {
    const { badgeType } = req.params;
    const { walletAddress } = req.user;

    const validBadgeTypes = ['streak', 'early-repay'];
    
    if (!validBadgeTypes.includes(badgeType)) {
      throw new AppError('Invalid badge type', 400);
    }

    // TODO: Verify eligibility from blockchain state
    // For streak badge: check if user has 10+ streak
    // For early-repay badge: check if user repaid loan early

    res.json({
      success: true,
      message: 'Badge claim prepared',
      badge: {
        type: badgeType,
        recipient: walletAddress,
        // In production, return transaction CBOR for signing
        cbor: 'placeholder_badge_mint_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check badge eligibility
router.get('/eligibility/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // TODO: Check actual blockchain state for eligibility
    // This is a placeholder implementation

    const eligibility = {
      streakBadge: {
        eligible: false,
        currentStreak:currentStreak,
        requiredStreak: 10,
        reason: 'Need 10+ consecutive savings'
      },
      earlyRepayBadge: {
        eligible: false,
        reason: 'No early loan repayments found'
      }
    };
s.json({
      success: true,
      walletAddress,
      eligibility
    });
  } catch (error) {
    next(error);
  }
});

// Helper to decode badge name from asset unit
function decodeBadgeName(assetUnit) {
  // Extract the asset name from the unit (policy_id + asset_name)
  const assetName = assetUnit.substring(56); // Policy ID is 56 chars
  try {
    return Buffer.from(assetName, 'hex').toString('utf8');
  } catch {
    return 'Unknown Badge';
  }
}

export default router;
