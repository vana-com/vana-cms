# DataDAO Updater Scripts

This directory contains TypeScript scripts to automatically sync DataDAO information from the Vana subgraph and external APIs into the Sanity CMS.

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   cd scripts
   pnpm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Test connections:**

   ```bash
   pnpm run test
   ```

4. **Run manual update:**
   ```bash
   pnpm run update
   ```

## 📋 Required Environment Variables

Create a `.env` file with these variables:

| Variable                | Description                   | Example                                      |
| ----------------------- | ----------------------------- | -------------------------------------------- |
| `SANITY_PROJECT_ID`     | Your Sanity project ID        | `o4sryq32`                                   |
| `SANITY_DATASET`        | Sanity dataset name           | `mainnet`                                    |
| `SANITY_WRITE_TOKEN`    | Sanity write token            | `skfOCTkz...`                                |
| `SUBGRAPH_URL`          | Vana subgraph endpoint        | `https://api.goldsky.com/api/public/...`    |
| `VANASCAN_API_URL`      | VanaScan API for token data   | `https://vanascan.io`                        |
| `LOG_LEVEL`             | Logging verbosity (optional)  | `debug`, `info`, `error`                     |

## 🔑 Getting a Sanity Write Token

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (`DataDAOs`)
3. Go to **API** → **Tokens**
4. Click **Add API token**
5. Give it a name like "DataDAO Updater"
6. Set permissions to **Editor** or **Admin**
7. Copy the token and add it to your `.env` file

## 📊 What Gets Updated

The repository includes a GitHub Action that runs automatically every hour. The script syncs data from multiple sources to Sanity fields:

- Authority Fields (Always Override from Source)
- Initial Fields (Manual Edits Preserved)

### From Vana Subgraph
| Subgraph Field                    | Sanity Field           | Type      | Description                     |
| --------------------------------- | ---------------------- | --------- | ------------------------------- |
| `id`                              | `id`                   | Authority | DLP unique identifier           |
| `name`                            | `name`                 | Initial   | DataDAO name                    |
| `address`                         | `contractAddress`      | Authority | DLP contract address            |
| `website`                         | `website`              | Initial   | Official website URL            |
| `iconUrl`                         | `icon`                 | Initial   | DataDAO icon/logo (uploaded)    |
| `token`                           | `tokenContract`        | Authority | Token contract address          |
| `totals.uniqueFileContributors`   | `contributorCount`     | Authority | Number of contributors          |
| `totals.totalFileContributions`   | `filesCount`           | Authority | Number of files contributed     |
| `verificationBlockNumber`         | `isVerified`           | Authority | Verification status (calculated from block number) |
| `refiners[latest].schemaDefinitionUrl` | `dataSchemaRefined` | Authority | Latest refiner schema URL       |
| `refiners[latest].id`             | `refinerId`            | Authority | Latest refiner ID               |

### From Refiner Schema (IPFS)
| Schema Field                      | Sanity Field           | Type      | Description                     |
| --------------------------------- | ---------------------- | --------- | ------------------------------- |
| `name`                            | `dataName`             | Authority | Refined dataset name            |
| `description`                     | `dataDescription`      | Authority | Refined dataset description     |

### From VanaScan API
| API Field                         | Sanity Field           | Type      | Description                     |
| --------------------------------- | ---------------------- | --------- | ------------------------------- |
| `token.symbol`                    | `tokenSymbol`          | Authority | Token symbol (e.g., $BOPS)      |

### Smart Document Creation
- New DataDAOs are created as **draft documents** with the ID `drafts.dataDAO-{dlpId}`
- Draft status allows for editorial review before publishing
- Existing documents are updated using their actual Sanity document IDs

## 🔧 Scripts Overview

### `update-datadaos.ts`

Main TypeScript sync script that:

- **GraphQL Data Fetching**: Queries all DLP data from the Vana subgraph
- **Multi-Source Integration**: Fetches token symbols from VanaScan API and refiner schemas from IPFS
- **Image Management**: Automatically uploads DataDAO icons from URLs to Sanity media library
- **Smart Field Updates**: Uses a two-tier system (authority vs initial fields) to preserve manual edits
- **Document Management**: Creates new DataDAO documents as drafts and updates existing ones
- **Error Handling**: Comprehensive logging and graceful failure recovery
- **Type Safety**: Full TypeScript coverage with custom type definitions
- **Rate Limiting**: Controlled delays to respect API quotas

### `test-connection.ts`

Comprehensive test script that verifies:

- **Environment Setup**: All required environment variables are configured
- **Sanity Integration**: Connection, read/write permissions, and existing document access
- **Subgraph Connection**: GraphQL endpoint availability and data structure validation
- **Data Mapping Logic**: Simulates the field mapping process with sample data
- **Schema Compatibility**: Ensures subgraph response matches expected TypeScript interfaces
- **Visual Feedback**: Provides clear pass/fail status with detailed error reporting

### `types.ts`

Comprehensive TypeScript type definitions covering:

- **Subgraph Types**: GraphQL response structures for DLPs, refiners, and totals
- **Sanity Types**: CMS document schemas and update data structures
- **API Types**: VanaScan token response and refiner schema formats
- **Configuration**: Environment settings and client configurations
- **Processing Types**: Intermediate data structures and update results
- **Utility Types**: Update statistics and operation results

### `remove-field.ts`

Utility script for safely removing fields from Sanity CMS documents:

- **Generic Field Removal**: Remove any field from any document type with a single command
- **Multi-Environment Support**: Works with both mainnet and moksha environments
- **Safety Features**: Dry-run mode, confirmation prompts, and backup reminders
- **Batch Processing**: Efficiently handles large datasets with progress tracking
- **Error Handling**: Continues processing if individual documents fail
- **Comprehensive Logging**: Detailed progress updates and completion statistics

**Usage Examples:**
```bash
# Remove field from mainnet (default)
npm run remove-field dataDAO fieldName

# Preview changes without executing (safe)
npm run remove-field dataDAO fieldName -- --dry-run

# Remove field from moksha environment
npm run remove-field:moksha dataDAO fieldName

# Or use environment parameter
npm run remove-field dataDAO fieldName -- --env moksha

# Show help
npm run remove-field -- --help
```

**Safety Guidelines:**
- ⚠️ **Always backup your dataset before running field removal**
- 🔍 **Use `--dry-run` first to preview changes**
- ✅ **Test on moksha environment before running on mainnet**
- 📝 **Document which fields you're removing and why**

**Common Use Cases:**
- Remove deprecated fields after schema changes
- Clean up test data or incorrectly populated fields
- Bulk field removal when restructuring documents