#!/bin/bash

# Smart Saving - Cardano Smart Contract Deployment Script
# This script deploys all 5 validators to Cardano testnet and extracts contract addresses

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK="preprod"  # Change to "mainnet" for production
NETWORK_MAGIC="1"  # 1 for preprod, 2 for preview, remove for mainnet

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Smart Saving - Contract Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v aiken &> /dev/null; then
    echo -e "${RED}Error: Aiken is not installed${NC}"
    echo "Install from: https://aiken-lang.org/installation-instructions"
    exit 1
fi

if ! command -v cardano-cli &> /dev/null; then
    echo -e "${RED}Error: cardano-cli is not installed${NC}"
    echo "Install from: https://developers.cardano.org/docs/get-started/installing-cardano-node"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Build contracts
echo -e "${YELLOW}Building Aiken contracts...${NC}"
aiken build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Aiken build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contracts built successfully${NC}"
echo ""

# Create deployment directory
DEPLOY_DIR="deployment"
mkdir -p $DEPLOY_DIR

# Extract validator scripts from plutus.json
echo -e "${YELLOW}Extracting validator scripts...${NC}"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed (required for JSON parsing)${NC}"
    echo "Install: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
    exit 1
fi

# Extract each validator
VALIDATORS=("savings" "loan" "investment" "rewards" "governance")

for validator in "${VALIDATORS[@]}"; do
    echo -e "  Extracting ${validator} validator..."
    
    # Extract the compiled code from plutus.json
    jq -r ".validators[] | select(.title == \"${validator}.spend\" or .title == \"${validator}.mint\") | .compiledCode" plutus.json > "$DEPLOY_DIR/${validator}.plutus"
    
    if [ ! -s "$DEPLOY_DIR/${validator}.plutus" ]; then
        echo -e "${RED}Error: Failed to extract ${validator} validator${NC}"
        exit 1
    fi
    
    # Create the script file for cardano-cli
    cat > "$DEPLOY_DIR/${validator}.script" <<EOF
{
    "type": "PlutusScriptV2",
    "description": "${validator} validator",
    "cborHex": "$(cat $DEPLOY_DIR/${validator}.plutus)"
}
EOF
    
    echo -e "${GREEN}  ✓ ${validator} validator extracted${NC}"
done

echo ""

# Generate script addresses
echo -e "${YELLOW}Generating script addresses...${NC}"

# Create addresses file
ADDRESSES_FILE="$DEPLOY_DIR/contract_addresses.txt"
ENV_FILE="$DEPLOY_DIR/contract_addresses.env"

echo "# Smart Saving Contract Addresses" > $ADDRESSES_FILE
echo "# Generated on $(date)" >> $ADDRESSES_FILE
echo "# Network: $NETWORK" >> $ADDRESSES_FILE
echo "" >> $ADDRESSES_FILE

echo "# Smart Saving Contract Addresses for .env" > $ENV_FILE
echo "# Copy these to your backend/.env file" >> $ENV_FILE
echo "" >> $ENV_FILE

for validator in "${VALIDATORS[@]}"; do
    echo -e "  Generating address for ${validator}..."
    
    # Generate script address
    if [ "$NETWORK" == "mainnet" ]; then
        ADDRESS=$(cardano-cli address build \
            --payment-script-file "$DEPLOY_DIR/${validator}.script" \
            --mainnet)
    else
        ADDRESS=$(cardano-cli address build \
            --payment-script-file "$DEPLOY_DIR/${validator}.script" \
            --testnet-magic $NETWORK_MAGIC)
    fi
    
    # Get script hash
    SCRIPT_HASH=$(cardano-cli transaction policyid \
        --script-file "$DEPLOY_DIR/${validator}.script")
    
    # Save to files
    echo "${validator^^}_CONTRACT_ADDRESS=$ADDRESS" >> $ADDRESSES_FILE
    echo "${validator^^}_SCRIPT_HASH=$SCRIPT_HASH" >> $ADDRESSES_FILE
    echo "" >> $ADDRESSES_FILE
    
    # Save to env format
    echo "${validator^^}_CONTRACT_ADDRESS=$ADDRESS" >> $ENV_FILE
    
    echo -e "${GREEN}  ✓ ${validator}: $ADDRESS${NC}"
done

echo ""

# Create deployment info JSON
echo -e "${YELLOW}Creating deployment info...${NC}"

cat > "$DEPLOY_DIR/deployment_info.json" <<EOF
{
  "network": "$NETWORK",
  "networkMagic": "$NETWORK_MAGIC",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
EOF

first=true
for validator in "${VALIDATORS[@]}"; do
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$DEPLOY_DIR/deployment_info.json"
    fi
    
    ADDRESS=$(grep "${validator^^}_CONTRACT_ADDRESS" $ADDRESSES_FILE | cut -d'=' -f2)
    SCRIPT_HASH=$(grep "${validator^^}_SCRIPT_HASH" $ADDRESSES_FILE | cut -d'=' -f2)
    
    cat >> "$DEPLOY_DIR/deployment_info.json" <<EOF
    "${validator}": {
      "address": "$ADDRESS",
      "scriptHash": "$SCRIPT_HASH",
      "scriptFile": "${validator}.script"
    }
EOF
done

cat >> "$DEPLOY_DIR/deployment_info.json" <<EOF

  }
}
EOF

echo -e "${GREEN}✓ Deployment info created${NC}"
echo ""

# Create integration guide
cat > "$DEPLOY_DIR/INTEGRATION_GUIDE.md" <<'EOF'
# Smart Saving - Backend Integration Guide

## Contract Addresses

All contract addresses have been generated and saved to:
- `contract_addresses.txt` - Human-readable format
- `contract_addresses.env` - Ready to copy to `.env`
- `deployment_info.json` - JSON format for programmatic use

## Integration Steps

### 1. Update Backend Environment Variables

Copy the addresses from `contract_addresses.env` to your `backend/.env` file:

```bash
cd backend
cat ../deployment/contract_addresses.env >> .env
```

### 2. Verify Blockfrost Configuration

Make sure your `.env` has:
```
BLOCKFROST_PROJECT_ID=your-project-id
BLOCKFROST_NETWORK=preprod
```

Get your Blockfrost API key from: https://blockfrost.io

### 3. Test Contract Queries

Use the provided test script:
```bash
cd backend
npm run test:contracts
```

### 4. Query Contract UTxOs

Example using Blockfrost:
```javascript
const response = await fetch(
  `https://cardano-${network}.blockfrost.io/api/v0/addresses/${contractAddress}/utxos`,
  {
    headers: { 'project_id': BLOCKFROST_PROJECT_ID }
  }
);
```

### 5. Build Transactions

Use `@meshsdk/core` or `@emurgo/cardano-serialization-lib` to:
1. Query UTxOs from contract addresses
2. Build transactions with proper datums
3. Attach validator scripts
4. Sign with user wallet
5. Submit to blockchain

## Contract Functions

### Savings Contract
- **deposit()** - User deposits funds
- **penalize()** - Reset streak for missed deposit
- **borrow()** - Issue loan from group funds
- **invest()** - Register investment

### Loan Contract
- **repayLoan()** - Repay loan amount
- **checkLate()** - Apply penalty for late payment

### Investment Contract
- **updateProfit()** - Record investment profit
- **distribute()** - Distribute profits to group

### Rewards Contract
- **mintStreakBadge()** - Mint NFT for 10+ streak
- **mintEarlyRepayBadge()** - Mint NFT for early repayment

### Governance Contract
- **updateRules()** - Update system rules (leader only)

## Datum Structures

All datum structures are defined in `lib/smart_saving.ak`:

- **SavingsDatum**: Group or Member state
- **LoanDatum**: Loan details
- **InvestmentDatum**: Investment details
- **GovernanceDatum**: System rules

## Testing on Testnet

1. Get test ADA from faucet: https://docs.cardano.org/cardano-testnet/tools/faucet
2. Use Eternl or Nami wallet on testnet
3. Test each contract function
4. Monitor transactions on: https://preprod.cardanoscan.io

## Production Deployment

When ready for mainnet:
1. Change `NETWORK="mainnet"` in deploy.sh
2. Remove `NETWORK_MAGIC` parameter
3. Re-run deployment script
4. Update backend `.env` with mainnet addresses
5. Test thoroughly before going live!

## Support

- Aiken Docs: https://aiken-lang.org
- Cardano Docs: https://docs.cardano.org
- Blockfrost Docs: https://docs.blockfrost.io
EOF

echo -e "${GREEN}✓ Integration guide created${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}All contracts deployed successfully!${NC}"
echo ""
echo -e "Deployment files created in: ${YELLOW}$DEPLOY_DIR/${NC}"
echo ""
echo -e "📁 Files created:"
echo -e "  • ${YELLOW}contract_addresses.txt${NC} - Human-readable addresses"
echo -e "  • ${YELLOW}contract_addresses.env${NC} - Ready for .env file"
echo -e "  • ${YELLOW}deployment_info.json${NC} - JSON format"
echo -e "  • ${YELLOW}INTEGRATION_GUIDE.md${NC} - Integration instructions"
echo -e "  • ${YELLOW}*.script${NC} - Validator scripts (5 files)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Copy addresses to backend/.env:"
echo -e "     ${BLUE}cat $DEPLOY_DIR/contract_addresses.env >> backend/.env${NC}"
echo ""
echo -e "  2. Add your Blockfrost API key to backend/.env"
echo ""
echo -e "  3. Read the integration guide:"
echo -e "     ${BLUE}cat $DEPLOY_DIR/INTEGRATION_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}"
