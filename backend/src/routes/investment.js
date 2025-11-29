import express from 'express';
import { authenticateWallet } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import blockfrostService from '../services/blockfrost.js';
import cardanoService from '../services/cardano.js';

const router = express.Router();

// List all investments
router.get('/list', authenticateWallet, async (req, res, next) => {
  try {
    const investmentContractAddress = process.env.INVESTMENT_CONTRACT_ADDRESS;

    if (!investmentContractAddress) {
      throw new AppError('Investment contract address not configured', 500);
    }

    const utxos = await blockfrostService.getScriptUtxos(investmentContractAddress);
    
    const investments = [];
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        // Investment datum: Investment(id, project_name, amount_invested, expected_roi, real_profit, status)
        if (parsed && parsed.fields) {
          const [id, projectName, amountInvested, expectedROI, realProfit, status] = parsed.fields;
          
          investments.push({
            id: Buffer.from(id, 'hex').toString('utf8'),
            projectName: Buffer.from(projectName, 'hex').toString('utf8'),
            amountInvested: cardanoService.lovelaceToAda(amountInvested),
            expectedROI: expectedROI / 100, // Convert to percentage
            realProfit: cardanoService.lovelaceToAda(realProfit),
            status: this.getInvestmentStatus(status),
            utxoRef: `${utxo.tx_hash}#${utxo.output_index}`
          });
        }
      }
    }

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const totalProfit = investments.reduce((sum, inv) => sum + inv.realProfit, 0);

    res.json({
      success: true,
      investments,
      summary: {
        totalInvestments: investments.length,
        totalInvested,
        totalProfit,
        roi: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific investment
router.get('/:id', authenticateWallet, async (req, res, next) => {
  try {
    const { id } = req.params;
    const investmentContractAddress = process.env.INVESTMENT_CONTRACT_ADDRESS;

    if (!investmentContractAddress) {
      throw new AppError('Investment contract address not configured', 500);
    }

    const utxos = await blockfrostService.getScriptUtxos(investmentContractAddress);
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        if (parsed && parsed.fields) {
          const [investmentId, projectName, amountInvested, expectedROI, realProfit, status] = parsed.fields;
          const decodedId = Buffer.from(investmentId, 'hex').toString('utf8');
          
          if (decodedId === id) {
            return res.json({
              success: true,
              investment: {
                id: decodedId,
                projectName: Buffer.from(projectName, 'hex').toString('utf8'),
                amountInvested: cardanoService.lovelaceToAda(amountInvested),
                expectedROI: expectedROI / 100,
                realProfit: cardanoService.lovelaceToAda(realProfit),
                status: this.getInvestmentStatus(status),
                utxoRef: `${utxo.tx_hash}#${utxo.output_index}`
              }
            });
          }
        }
      }
    }

    throw new AppError('Investment not found', 404);
  } catch (error) {
    next(error);
  }
});

// Register new investment
router.post('/register', authenticateWallet, async (req, res, next) => {
  try {
    const { projectName, amount, expectedROI } = req.body;
    const { walletAddress } = req.user;

    if (!projectName || !amount || !expectedROI) {
      throw new AppError('Missing required fields', 400);
    }

    if (amount <= 0) {
      throw new AppError('Invalid investment amount', 400);
    }

    const investmentId = `INV-${Date.now()}`;

    res.json({
      success: true,
      message: 'Investment registration prepared',
      investment: {
        id: investmentId,
        projectName,
        amount,
        expectedROI,
        registeredBy: walletAddress,
        // In production, return transaction CBOR for signing
        cbor: 'placeholder_investment_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper to decode investment status
function getInvestmentStatus(statusConstructor) {
  switch (statusConstructor) {
    case '0': return 'Active';
    case '1': return 'Completed';
    default: return 'Unknown';
  }
}

export default router;
