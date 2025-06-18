# Vana CMS

A sophisticated content management system for the Vana blockchain ecosystem that automatically syncs DataDAO information from smart contracts into a user-friendly CMS interface powered by Sanity.io.

## 🌟 Overview

The **Vana DataDAO CMS** bridges the gap between blockchain smart contracts and professional content management, providing a centralized hub for managing information about Data DAOs (Decentralized Autonomous Organizations) in the Vana network. This system automatically synchronizes data from the Vana DLP Registry smart contract while enabling rich content editing capabilities for community managers and DataDAO operators.

### Key Features

- 🔗 **Automated Blockchain Sync** - Hourly synchronization with Vana smart contracts
- 📝 **Rich Content Management** - Professional editing interface with rich text, images, and structured data
- 🏗️ **Comprehensive Schema** - 84+ fields covering every aspect of DataDAO operations
- 🔒 **Type-Safe Integration** - Full TypeScript coverage from smart contracts to CMS
- 🚀 **Zero-Config Deployment** - Automated GitHub Actions for continuous synchronization
- 🌐 **Professional UI** - Modern content studio built on Sanity v3

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Sanity account with project access
- Vana subgraph access (no direct blockchain connection required)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd vana-cms
pnpm install
```

### 2. Configure Environment

```bash
# Copy and configure environment variables
cp scripts/.env.example scripts/.env
# Edit scripts/.env with your Sanity write token and subgraph URL
```

### 3. Test Connections

```bash
cd scripts
pnpm test
```

### 4. Start Development

```bash
# Start Sanity Studio
pnpm dev

# Run manual sync (optional)
cd scripts && pnpm run update
```

### 5. Deploy Studio

```bash
# Manual deployment (optional - automated on main branch)
pnpm deploy
```

## 📊 Data Management

### DataDAO Schema

The system manages comprehensive DataDAO information with **84 specialized fields**:

| Category | Fields | Purpose |
|----------|--------|---------|
| **Basic Info** | Name, ID, Contract, Icon, Website | Core identification |
| **Contact** | Email, Twitter, Social Links | Communication channels |
| **Data Management** | Sources, Schemas, Samples, Statistics | Data organization |
| **Tokenomics** | Contracts, Pricing, Reward Mechanics | Economic structure |
| **Contribution** | Steps, Frequency, Proof Systems | User participation |
| **Access Control** | Operations, Terms, Templates | Data governance |

### Data Integration Architecture

- **Data Source**: Vana Subgraph (Goldsky)
- **Additional APIs**: VanaScan API for token information
- **Sync Frequency**: Every hour via GitHub Actions

## 🔧 Development

### Project Structure

```
vana-cms/
├── schemaTypes/           # Sanity schema definitions
│   ├── dataDAO.ts        # Main DataDAO schema (84 fields)
│   ├── dataSource.ts     # Data source categorization
│   └── index.ts          # Schema exports
├── scripts/              # Subgraph sync automation
│   ├── update-datadaos.ts # Main sync script (TypeScript)
│   ├── test-connection.ts # Connection testing
│   ├── types.ts          # Type definitions
│   └── package.json      # Scripts dependencies
├── .github/workflows/    # GitHub Actions
│   └── update-datadaos.yml # Hourly sync workflow
└── static/               # Static assets
```

### Available Commands

```bash
# Development
pnpm dev                  # Start Sanity Studio
pnpm build               # Build for production
pnpm deploy              # Deploy to Sanity hosting

# Subgraph Sync (in scripts/)
cd scripts
npm test                # Test all connections
npm run update          # Manual sync
npm run dev             # Watch mode for development
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SANITY_PROJECT_ID` | Sanity project identifier | `o4sryq32` |
| `SANITY_DATASET` | Dataset name | `mainnet` |
| `SANITY_WRITE_TOKEN` | API token with write permissions | `sk_test_...` |
| `SUBGRAPH_URL` | Vana subgraph GraphQL endpoint | `https://api.goldsky.com/api/public/...` |
| `VANASCAN_API_URL` | VanaScan API for token data | `https://vanascan.io` |
