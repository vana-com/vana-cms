#!/usr/bin/env tsx

import {createClient} from '@sanity/client'
import * as dotenv from 'dotenv'
import * as readline from 'readline'
import type {Config} from './types.js'

// Load environment variables (will be updated after parsing arguments)
// Initial load with default path
dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || '.env',
})

// Configuration
const config: Config = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID!,
    dataset: process.env.SANITY_DATASET!,
    token: process.env.SANITY_WRITE_TOKEN!,
    apiVersion: '2023-05-03',
    useCdn: false,
  },
  subgraph: {
    url: process.env.SUBGRAPH_URL!,
  },
  vanascan: {
    apiUrl: process.env.VANASCAN_API_URL || 'https://vanascan.io',
  },
}

// Initialize Sanity client
const sanityClient = createClient(config.sanity)

// Utility functions
function log(level: 'info' | 'error' | 'debug' | 'warn', message: string): void {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`)
      break
    case 'warn':
      console.warn(`${prefix} ${message}`)
      break
    case 'debug':
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(`${prefix} ${message}`)
      }
      break
    default:
      console.log(`${prefix} ${message}`)
  }
}

function showUsage(): void {
  console.log(`
Usage: tsx remove-field.ts <documentType> <fieldName> [options]

Arguments:
  documentType    The Sanity document type (e.g., 'dataDAO', 'dataSource')
  fieldName       The field name to remove (e.g., 'isEligibleForRewards')

Options:
  --dry-run       Preview changes without executing them
  --env <env>     Environment to use ('mainnet' or 'moksha', default: 'mainnet')
  --help          Show this help message

Examples:
  tsx remove-field.ts dataDAO isEligibleForRewards
  tsx remove-field.ts dataDAO isEligibleForRewards --dry-run
  tsx remove-field.ts dataDAO isEligibleForRewards --env moksha
  npm run remove-field dataDAO isEligibleForRewards
  npm run remove-field:moksha dataDAO isEligibleForRewards
`)
}

function parseArguments(): {documentType: string; fieldName: string; dryRun: boolean; environment: string} | null {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage()
    return null
  }
  
  if (args.length < 2) {
    console.error('❌ Error: Missing required arguments')
    showUsage()
    return null
  }
  
  const documentType = args[0]
  const fieldName = args[1]
  const dryRun = args.includes('--dry-run')
  
  // Parse environment parameter
  let environment = 'mainnet' // default
  const envIndex = args.indexOf('--env')
  if (envIndex !== -1 && envIndex + 1 < args.length) {
    const envValue = args[envIndex + 1]
    if (envValue === 'mainnet' || envValue === 'moksha') {
      environment = envValue
    } else {
      console.error(`❌ Error: Invalid environment '${envValue}'. Must be 'mainnet' or 'moksha'`)
      showUsage()
      return null
    }
  }
  
  return {documentType, fieldName, dryRun, environment}
}

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

interface DocumentWithField {
  _id: string
  _type: string
  [key: string]: any
}

async function fetchDocumentsWithField(
  documentType: string,
  fieldName: string,
  client: ReturnType<typeof createClient>
): Promise<DocumentWithField[]> {
  try {
    log('info', `Querying documents of type "${documentType}" with field "${fieldName}"...`)
    
    // Query both published and draft documents that have the specified field
    const query = `*[_type == "${documentType}" && defined(${fieldName})] | order(_id)`
    const documents = await client.fetch<DocumentWithField[]>(query)
    
    log('info', `Found ${documents.length} documents with field "${fieldName}"`)
    return documents
  } catch (error: any) {
    log('error', `Failed to fetch documents: ${error.message}`)
    throw error
  }
}

async function removeFieldFromDocuments(
  documents: DocumentWithField[],
  fieldName: string,
  dryRun: boolean,
  client: ReturnType<typeof createClient>
): Promise<void> {
  if (documents.length === 0) {
    log('info', 'No documents found with the specified field')
    return
  }
  
  log('info', `${dryRun ? '[DRY RUN] ' : ''}Removing field "${fieldName}" from ${documents.length} documents...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    const progress = `[${i + 1}/${documents.length}]`
    
    try {
      log('debug', `${progress} Processing document: ${doc._id}`)
      
      if (!dryRun) {
        // Use Sanity's unset mutation to remove the field
        await client
          .patch(doc._id)
          .unset([fieldName])
          .commit()
      }
      
      successCount++
      log('info', `${progress} ${dryRun ? '[DRY RUN] ' : ''}Removed field from ${doc._id}`)
    } catch (error: any) {
      errorCount++
      log('error', `${progress} Failed to remove field from ${doc._id}: ${error.message}`)
    }
  }
  
  log('info', `${dryRun ? '[DRY RUN] ' : ''}Operation completed:`)
  log('info', `  ✅ Successfully processed: ${successCount}`)
  if (errorCount > 0) {
    log('warn', `  ❌ Errors: ${errorCount}`)
  }
}

function loadEnvironmentConfig(environment: string): Config {
  // Check if DOTENV_CONFIG_PATH is set (from npm scripts like remove-field:moksha)
  if (process.env.DOTENV_CONFIG_PATH) {
    dotenv.config({
      path: process.env.DOTENV_CONFIG_PATH,
      override: true,
    })
  } else {
    // Use environment parameter to determine .env file
    const envPath = environment === 'moksha' ? '.env.moksha' : '.env'
    dotenv.config({
      path: envPath,
      override: true, // Override existing variables
    })
  }
  
  return {
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID!,
      dataset: process.env.SANITY_DATASET!,
      token: process.env.SANITY_WRITE_TOKEN!,
      apiVersion: '2023-05-03',
      useCdn: false,
    },
    subgraph: {
      url: process.env.SUBGRAPH_URL!,
    },
    vanascan: {
      apiUrl: process.env.VANASCAN_API_URL || 'https://vanascan.io',
    },
  }
}

async function main(): Promise<void> {
  log('info', '🛠️  Sanity Field Removal Tool')
  
  // Parse command line arguments
  const args = parseArguments()
  if (!args) {
    process.exit(1)
  }
  
  const {documentType, fieldName, dryRun, environment} = args
  
  // Load environment-specific configuration
  const envConfig = loadEnvironmentConfig(environment)
  const sanityClient = createClient(envConfig.sanity)
  
  log('info', `Environment: ${environment} (${envConfig.sanity.dataset})`)
  
  try {
    // Validate environment
    if (!envConfig.sanity.projectId || !envConfig.sanity.dataset || !envConfig.sanity.token) {
      throw new Error('Missing required Sanity configuration. Check your .env file.')
    }
    
    log('info', `Document Type: ${documentType}`)
    log('info', `Field Name: ${fieldName}`)
    log('info', `Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will make changes)'}`)
    
    // Fetch documents with the field
    const documents = await fetchDocumentsWithField(documentType, fieldName, sanityClient)
    
    if (documents.length === 0) {
      log('info', '✅ No documents found with the specified field. Nothing to do.')
      return
    }
    
    // Show preview of affected documents
    log('info', '📄 Documents that will be affected:')
    documents.slice(0, 10).forEach((doc, index) => {
      const docId = doc._id.startsWith('drafts.') ? doc._id.replace('drafts.', '') + ' (draft)' : doc._id
      const fieldValue = doc[fieldName]
      log('info', `  ${index + 1}. ${docId} - ${fieldName}: ${JSON.stringify(fieldValue)}`)
    })
    
    if (documents.length > 10) {
      log('info', `  ... and ${documents.length - 10} more documents`)
    }
    
    // Ask for confirmation unless in dry-run mode
    if (!dryRun) {
      log('warn', '⚠️  This will permanently remove the field from all listed documents!')
      log('warn', '⚠️  Make sure you have a backup of your Sanity dataset before proceeding.')
      
      const confirmed = await askConfirmation(
        `Are you sure you want to remove "${fieldName}" from ${documents.length} ${documentType} documents?`
      )
      
      if (!confirmed) {
        log('info', 'Operation cancelled by user')
        return
      }
    }
    
    // Remove the field from documents
    await removeFieldFromDocuments(documents, fieldName, dryRun, sanityClient)
    
    if (dryRun) {
      log('info', '✅ Dry run completed. No changes were made.')
      log('info', '💡 Run without --dry-run to execute the changes.')
    } else {
      log('info', '✅ Field removal completed!')
    }
    
  } catch (error: any) {
    log('error', `Script failed: ${error.message}`)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log('error', `Unhandled error: ${error.message}`)
    process.exit(1)
  })
}