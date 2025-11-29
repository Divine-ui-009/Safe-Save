import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { AppError } from '../middleware/errorHandler.js';

class BlockfrostService {
  constructor() {
    if (!process.env.BLOCKFROST_PROJECT_ID) {
      throw new Error('BLOCKFROST_PROJECT_ID is not set');
    }
    
    this.api = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_PROJECT_ID,
      network: process.env.BLOCKFROST_NETWORK || 'preprod'
    });
  }

  async getAddressUtxos(address) {
    try {
      return await this.api.addressesUtxos(address);
    } catch (error) {
      throw new AppError(`Failed to fetch UTxOs: ${error.message}`, 500);
    }
  }

  async getScriptUtxos(scriptAddress) {
    try {
      return await this.api.addressesUtxos(scriptAddress);
    } catch (error) {
      throw new AppError(`Failed to fetch script UTxOs: ${error.message}`, 500);
    }
  }

  async submitTransaction(txCbor) {
    try {
      return await this.api.txSubmit(txCbor);
    } catch (error) {
      throw new AppError(`Transaction submission failed: ${error.message}`, 500);
    }
  }

  async getTransaction(txHash) {
    try {
      return await this.api.txs(txHash);
    } catch (error) {
      throw new AppError(`Failed to fetch transaction: ${error.message}`, 500);
    }
  }

  async getLatestBlock() {
    try {
      return await this.api.blocksLatest();
    } catch (error) {
      throw new AppError(`Failed to fetch latest block: ${error.message}`, 500);
    }
  }

  async getProtocolParameters() {
    try {
      const latest = await this.getLatestBlock();
      return await this.api.epochsParameters(latest.epoch);
    } catch (error) {
      throw new AppError(`Failed to fetch protocol parameters: ${error.message}`, 500);
    }
  }
}

export default new BlockfrostService();
