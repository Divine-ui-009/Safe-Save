# Deployment Guide

## 🚀 Quick Start

### 1. Deploy Smart Contracts

First, deploy your Aiken smart contracts to Cardano testnet:

```bash
# From the root directory
cd ..
aiken build

# Deploy using cardano-cli or a deployment tool
# Record the contract addresses
```

### 2. Get Blockfrost API Key

1. Go to [blockfrost.io](https://blockfrost.io)
2. Sign up for a free account
3. Create a new project for Cardano Preprod
4. Copy your project ID

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SAVINGS_CONTRACT_ADDRESS=addr_test1qz...
LOAN_CONTRACT_ADDRESS=addr_test1qz...
INVESTMENT_CONTRACT_ADDRESS=addr_test1qz...
REWARDS_CONTRACT_ADDRESS=addr_test1qz...
GOVERNANCE_CONTRACT_ADDRESS=addr_test1qz...
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Server will start on `http://localhost:3000`

## 🌐 Production Deployment

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

```bash
# On your server
git clone <your-repo>
cd backend
npm install --production
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start src/server.js --name safe-save-api
pm2 save
pm2 startup
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

Build and run:
```bash
docker build -t safe-save-backend .
docker run -p 3000:3000 --env-file .env safe-save-backend
```

### Option 3: Serverless (Vercel, Railway, Render)

Most platforms auto-detect Node.js apps. Just:
1. Connect your Git repository
2. Set environment variables in the platform dashboard
3. Deploy!

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT_SECRET
- [ ] Enable CORS only for your frontend domain
- [ ] Add rate limiting
- [ ] Implement proper signature verification
- [ ] Use environment variables for all secrets
- [ ] Enable logging and monitoring
- [ ] Set up automated backups (if using database)
- [ ] Implement health checks
- [ ] Use a reverse proxy (nginx/Caddy)

## 📊 Monitoring

### Health Check Endpoint

```bash
curl https://your-api.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T10:30:00Z",
  "network": "preprod"
}
```

### Recommended Monitoring Tools

- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, Logtail
- **Errors**: Sentry
- **Performance**: New Relic, DataDog

## 🔄 CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          # e.g., rsync to VPS, deploy to Vercel, etc.
```

## 🌍 Environment-Specific Configs

### Development
```env
NODE_ENV=development
BLOCKFROST_NETWORK=preprod
```

### Production
```env
NODE_ENV=production
BLOCKFROST_NETWORK=mainnet
```

## 📝 Post-Deployment

1. **Test all endpoints** using the provided Postman collection
2. **Monitor logs** for any errors
3. **Set up alerts** for downtime
4. **Document** your API URL for frontend team
5. **Update** frontend environment variables with API URL

## 🆘 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify all environment variables are set
- Check Node.js version (18+)

### Blockfrost errors
- Verify your project ID is correct
- Check if you're using the right network (preprod/mainnet)
- Ensure you haven't exceeded rate limits

### Contract address errors
- Verify contracts are deployed
- Check addresses are for the correct network
- Ensure addresses include the full bech32 format

## 📞 Support

For issues:
1. Check logs: `pm2 logs safe-save-api`
2. Review Blockfrost dashboard for API usage
3. Test endpoints individually
4. Check smart contract deployment status
