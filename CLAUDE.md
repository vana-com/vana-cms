# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sophisticated Sanity CMS project that automatically syncs DataDAO information from the Vana blockchain ecosystem via subgraph integration. The CMS provides a professional content management interface for the Vana network, enabling seamless management of DataDAO information with automated blockchain synchronization.

### About Vana
Vana enables communities to create DataDAOs (community-governed data pools) where users can:
- Contribute data to shared datasets
- Earn rewards through "Proof of Contribution" mechanisms  
- Participate in governance of data pools
- Monetize their data contributions through tokenomics

### CMS Purpose
This CMS manages comprehensive information about:
- **DataDAOs**: Community-governed data pools with 84+ specialized fields covering contribution steps, tokenomics, data access, and governance
- **Data Sources**: Categorized information about platforms where data originates (Amazon, Google, social media, etc.)
- **Automated Integration**: Multi-source data synchronization from Vana subgraph, VanaScan API, and IPFS schema definitions
- **Smart Field Management**: Two-tier update system preserving manual edits while syncing authoritative blockchain data

## Development Commands

- `pnpm dev` - Start development server for Sanity Studio
- `pnpm start` - Start production server  
- `pnpm build` - Build the project
- `pnpm deploy` - Deploy to Sanity hosting (studio host: vana) - automated on main branch
- `pnpm deploy-graphql` - Deploy GraphQL schema
- In scripts directory: `npm test`, `npm run update`, `npm run dev` - Test connections, run sync, watch mode

## Code Architecture

### Sanity Configuration
- `sanity.config.ts` - Main Sanity configuration
- `sanity.cli.ts` - CLI configuration with studio host "vana" and auto-updates enabled
- Uses structureTool and visionTool plugins

### Schema Management
- `schemaTypes/index.ts` - Central export for all schema types
- `schemaTypes/dataDAO.ts` - Main DataDAO document schema with 84 specialized fields organized in 6 fieldsets
- `schemaTypes/dataSource.ts` - Data source schema for platform categorization and metadata
- Rich text blocks, image uploads, and structured validation throughout schemas

### DataDAO Schema Structure (84 Fields)
The main DataDAO schema includes:
- **Basic Information**: DLP ID, name, contract address, icon, website, call-to-action, description
- **Contact & Social**: Email, Twitter, Telegram, Discord links
- **Data Contribution**: Step-by-step guides (rich text), frequency, verification status, proof structures
- **Data Management**: Data sources, refined/unrefined schemas, sample files, contributor/file statistics, population data
- **Tokenomics**: Token contracts, symbols, pricing, reward mechanics, macro tokenomics, pre-mine information
- **Data Access & Governance**: Operations allowed, terms of access, template access menus

### Data Source Schema Structure
- **Platform Information**: Name, icon, 16 predefined categories (shopping, social media, health, etc.)
- **Visual Organization**: Icon uploads with hotspot support for optimal display
- **Categorization**: Dropdown selection from standardized category list
- **Reference System**: DataDAOs can reference multiple data sources for comprehensive coverage

### Key Field Types Used
- **Rich Text**: Block content arrays with heading styles, lists, links, and embedded images
- **References**: DataDAOs link to multiple DataSources with visual previews
- **File Uploads**: Refined (.db, .sqlite, .libsql) and unrefined (.zip, .json, .csv, .txt) data samples
- **Image Management**: Icon uploads with hotspot support and automated external URL imports
- **URL Validation**: Ethereum addresses, social media handles, website links with regex patterns
- **Fieldsets**: Organized UI with collapsible sections for better content management experience

### Code Style
- Uses Prettier with specific formatting: no semicolons, 100 char line width, no bracket spacing, single quotes
- ESLint configuration extends @sanity/eslint-config-studio
- TypeScript with strict mode enabled

## Integration & Automation

### Multi-Source Data Synchronization
- **Vana Subgraph**: Primary data source for DLP information, statistics, and verification status
- **VanaScan API**: Token symbol resolution and contract metadata
- **IPFS Integration**: Automatic fetching and parsing of refiner schema definitions
- **Media Management**: Automated image uploads from external URLs to Sanity media library

### Two-Tier Field Management System
- **Authority Fields** (read-only): `id`, `contractAddress`, `tokenContract`, `tokenSymbol`, `contributorCount`, `filesCount`, `isVerified`, `isEligibleForRewards`, `dataSchemaRefined`, `refinerId`, `dataName`, `dataDescription`
- **Initial Fields** (editable): `name`, `icon`, `website`, `description`, `frequencyOfContribution`
- **Manual Fields**: All other content fields remain fully editable in Sanity Studio

### Automated Workflows
- **Hourly DataDAO Sync**: GitHub Actions synchronized updates every hour at minute 0
- **Automatic Studio Deployment**: Deploys to Sanity hosting when changes are merged to main
- **Draft Document Creation**: New DataDAOs created as drafts for editorial review
- **Error Handling**: Graceful failure recovery with detailed logging
- **Rate Limiting**: Controlled API request timing to respect service quotas

## Project Structure
- **Root Configuration**: `sanity.config.ts`, `sanity.cli.ts`, `package.json` with ESLint and Prettier setup
- **Schema Definitions**: `schemaTypes/` directory with TypeScript schema exports
- **Automation Scripts**: `scripts/` directory with TypeScript sync scripts and dependencies
- **GitHub Actions**: 
  - `.github/workflows/update-datadaos.yml` for automated hourly synchronization
  - `.github/workflows/deploy-studio.yml` for automatic deployment to Sanity hosting
- **Static Assets**: `static/` directory for static resources
- **Studio Deployment**: Hosted at "vana" studio host for the Vana ecosystem

## Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled throughout the project
- **Prettier**: 100 character line width, no semicolons, single quotes, no bracket spacing
- **ESLint**: Extends @sanity/eslint-config-studio for consistent code style
- **Type Safety**: Custom type definitions in `scripts/types.ts` ensure data integrity

### Content Management Best Practices
- **Field Validation**: Comprehensive validation rules for Ethereum addresses, URLs, and social handles
- **Rich Text Standards**: Consistent block content configuration across documentation fields
- **Image Optimization**: Hotspot support and proper alt text for accessibility
- **Reference Integrity**: Proper linking between DataDAOs and DataSources

### API Integration Patterns
- **GraphQL Queries**: Efficient single-query data fetching from subgraph
- **Error Boundaries**: Individual item failures don't break entire sync process
- **Data Validation**: Runtime type checking for external API responses
- **Fallback Handling**: Graceful degradation when external services are unavailable