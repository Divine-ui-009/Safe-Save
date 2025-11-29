import express from 'express';
import { authenticateWallet } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import blockfrostService from '../services/blockfrost.js';
import cardanoService from '../services/cardano.js';

const router = express.Router();

// Get user savings data
router.get('/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const savingsContractAddress = process.env.SAVINGS_CONTRACT_ADDRESS;

    if (!savingsContractAddress) {
      throw new AppError('Savings contract address not configured', 500);
    }

    // Find UTxOs with Member datum for this wallet
    const utxos = await blockfrostService.getScriptUtxos(savingsContractAddress);
    
    let memberData = null;
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        // Check if this is a Member datum (constructor 1)
        if (parsed && parsed.constructor === '1') {
          const [wallet, totalSavings, streak, lastDeposit] = parsed.fields;
          
          if (wallet === walletAddress.substring(2)) { // Remove addr prefix
            memberData = {
              wallet: walletAddress,
              totalSavings: cardanoService.lovelaceToAda(totalSavings),
              totalSavingsLovelace: totalSavings,
              streak,
              lastDeposit: new Date(lastDeposit).toISOString(),
              utxoRef: `${utxo.tx_hash}#${utxo.output_index}`
            };
            break;
          }
        }
      }
    }

    if (!memberData) {
      return res.json({
        success: true,
        savings: {
          wallet: walletAddress,
          totalSavings: 0,
          totalSavingsLovelace: 0,
          streak: 0,
          lastDeposit: null,
          isNewMember: true
        }
      });
    }

    res.json({
      success: true,
      savings: memberData
    });
  } catch (error) {
    next(error);
  }
});

// Get group savings total
router.get('/group/total', authenticateWallet, async (req, res, next) => {
  try {
    const savingsContractAddress = process.env.SAVINGS_CONTRACT_ADDRESS;

    if (!savingsContractAddress) {
      throw new AppError('Savings contract address not configured', 500);
    }

    const utxos = await blockfrostService.getScriptUtxos(savingsContractAddress);
    
    let groupTotal = 0;
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        // Check if this is a Group datum (constructor 0)
        if (parsed && parsed.constructor === '0') {
          const [totalBalance] = parsed.fields;
          groupTotal = totalBalance;
          break;
        }
      }
    }

    res.json({
      success: true,
      groupTotal: cardanoService.lovelaceToAda(groupTotal),
      groupTotalLovelace: groupTotal
    });
  } catch (error) {
    next(error);
  }
});

// Prepare deposit transaction
router.post('/deposit/prepare', authenticateWallet, async (req, res, next) => {
  try {
    const { amount } = req.body; // Amount in ADA
    const { walletAddress } = req.user;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid deposit amount', 400);
    }

    const lovelaceAmount = cardanoService.adaToLovelace(amount);

    // TODO: Build actual transaction using cardano-serialization-lib
    // This is a placeholder response
    res.json({
      success: true,
      message: 'Transaction prepared',
      transaction: {
        type: 'deposit',
        amount,
        lovelaceAmount,
        from: walletAddress,
        to: process.env.SAVINGS_CONTRACT_ADDRESS,
        // In production, return the actual CBOR transaction for wallet signing
        cbor: 'placeholder_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user streak
router.get('/streak/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const savingsContractAddress = process.env.SAVINGS_CONTRACT_ADDRESS;

    const utxos = await blockfrostService.getScriptUtxos(savingsContractAddress);
    
    let streak = 0;
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        if (parsed && parsed.constructor === '1') {
          const [wallet, , streakValue] = parsed.fields;
          
          if (wallet === walletAddress.substring(2)) {
            streak = streakValue;
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      streak,
      walletAddress
    });
  } catch (error) {
    next(error);
  }
});

export default router;
