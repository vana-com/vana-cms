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

## 🔍 GROQ Query Examples

The CMS provides powerful querying capabilities using GROQ (Graph-Relational Object Queries). Here are useful examples for common use cases:

### Token Queries

**Find token by contract address:**
```groq
*[_type == "token" && tokenContract == '0x202f120c83dcfce04a1723ae7ec7cdbd2ed73302'] {
  tokenContract,
  tokenName,
  tokenSymbol,
  description,
  icon
}
```

**Get all tokens with their associated DataDAOs:**
```groq
*[_type == "token"] {
  tokenContract,
  tokenName,
  tokenSymbol,
  associatedDataDAO-> {
    id,
    name,
    contributorCount
  }
}
```

### DataDAO Queries

**Find DataDAOs with active data and refiners:**
```groq
*[_type == "dataDAO" && contributorCount > 0 && refinerId != null && dataSchemaRefined != null && dataName != null] {
  id,
  name,
  contributorCount,
  refinerId,
  dataSchemaRefined,
  token-> {
    tokenSymbol,
    tokenContract
  }
}
```

**Get verified DataDAOs with token information:**
```groq
*[_type == "dataDAO" && isVerified == true] {
  id,
  name,
  description,
  website,
  contributorCount,
  filesCount,
  token-> {
    tokenSymbol,
    tokenName,
    tokenContract
  }
} | order(contributorCount desc)
```

**Find DataDAOs by contribution frequency:**
```groq
*[_type == "dataDAO" && frequencyOfContribution == "daily"] {
  id,
  name,
  website,
  contributorCount,
  contributionSteps,
  token->tokenSymbol
}
```

### Advanced Queries

**DataDAOs with complete tokenomics information:**
```groq
*[_type == "dataDAO" && defined(token) && defined(tokenomicsRewardMechanics)] {
  id,
  name,
  contributorCount,
  tokenomicsRewardMechanics,
  tokenomicsMacro,
  token-> {
    tokenSymbol,
    tokenContract,
    description
  }
} | order(contributorCount desc)
```

**Search DataDAOs by data source category:**
```groq
*[_type == "dataDAO" && count(dataSources[@->dataSourceCategory match "social-media"]) > 0] {
  id,
  name,
  description,
  dataSources[]-> {
    dataSourceName,
    dataSourceCategory,
    dataSourceIcon
  }
}
```

**Find DataDAOs with music data sources:**
```groq
*[_type == "dataDAO" && count(dataSources[@->dataSourceCategory match "music"]) > 0] {
  id,
  name,
  description,
  website,
  dataSources[]-> {
    dataSourceName,
    dataSourceCategory,
    dataSourceIcon
  }
}
```

**Get DataDAO statistics summary:**
```groq
*[_type == "dataDAO"] {
  "totalDataDAOs": count(*),
  "verifiedCount": count(*[isVerified == true]),
  "totalContributors": sum(contributorCount),
  "totalFiles": sum(filesCount)
}
```

### Data Source Queries

**Get data sources by category:**
```groq
*[_type == "dataSource" && "shopping" in dataSourceCategory] {
  dataSourceName,
  dataSourceCategory,
  dataSourceIcon
} | order(dataSourceName asc)
```

**Find all categories and their data sources:**
```groq
*[_type == "dataSource"] {
  dataSourceCategory,
  "sources": *[_type == "dataSource" && dataSourceCategory == ^.dataSourceCategory] {
    dataSourceName,
    dataSourceIcon
  }
} | order(dataSourceCategory asc)
```

### Vision Tool Usage

These queries can be tested directly in the Sanity Studio using the Vision tool:

1. Open your Sanity Studio
2. Navigate to the "Vision" tab
3. Paste any query above
4. Click "Execute" to see results

For more GROQ syntax and examples, visit the [GROQ documentation](https://www.sanity.io/docs/groq).
