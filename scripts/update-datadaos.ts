#!/usr/bin/env tsx

import {createClient} from '@sanity/client'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import type {
  Config,
  ProcessedDlpInfo,
  SanityDataDAO,
  SanityToken,
  SanityUpdateData,
  SanityTokenUpdateData,
  SubgraphResponse,
  SubgraphRefiner,
  RefinerSchemaData,
  VanaScanTokenResponse,
  UpdateResult,
  UpdateStats,
} from './types.js'

// Load environment variables
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
function log(level: 'info' | 'error' | 'debug', message: string, data: any = {}): void {
  const timestamp = new Date().toISOString()
  const logLevel = process.env.LOG_LEVEL || 'info'

  if (level === 'error' || logLevel === 'debug' || (logLevel === 'info' && level === 'info')) {
    console.log(
      `[${timestamp}] ${level.toUpperCase()}: ${message}`,
      Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '',
    )
  }
}

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

function isNonZeroAddress(address: string): boolean {
  return address !== '0x0000000000000000000000000000000000000000'
}

// Find the latest refiner's schema definition URL by sorting refiner IDs and picking the largest
function getLatestRefinerInfo(refiners: SubgraphRefiner[]): {url?: string; id?: number} {
  if (!refiners || refiners.length === 0) {
    return {}
  }

  // Sort refiners by ID (numeric) in descending order and get the first one
  const sortedRefiners = refiners
    .filter((refiner) => refiner.schemaDefinitionUrl && refiner.schemaDefinitionUrl.trim() !== '')
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))

  if (sortedRefiners.length > 0) {
    const latestRefiner = sortedRefiners[0]
    return {
      url: latestRefiner.schemaDefinitionUrl,
      id: parseInt(latestRefiner.id),
    }
  }

  return {}
}

// Fetch and parse refiner schema JSON from IPFS
async function fetchRefinerSchemaData(schemaUrl: string): Promise<RefinerSchemaData | undefined> {
  try {
    if (!schemaUrl || schemaUrl.trim() === '') {
      return undefined
    }

    log('debug', `Fetching refiner schema from: ${schemaUrl}`)

    const response = await fetch(schemaUrl.trim())
    if (!response.ok) {
      log('error', `Failed to fetch refiner schema from ${schemaUrl}: ${response.statusText}`)
      return undefined
    }

    const schemaJson = await response.json()

    // Extract name and description from the schema JSON
    if (schemaJson && typeof schemaJson === 'object') {
      const jsonObj = schemaJson as any // Type assertion for dynamic JSON object
      const refinerData: RefinerSchemaData = {
        name: jsonObj.name || '',
        description: jsonObj.description || '',
        version: jsonObj.version || '',
        dialect: jsonObj.dialect || '',
        schema: jsonObj.schema || '',
      }

      log('debug', `Successfully parsed refiner schema:`, refinerData)
      return refinerData
    }

    log('error', `Invalid schema JSON format from ${schemaUrl}`)
    return undefined
  } catch (error) {
    log('error', `Error fetching refiner schema from ${schemaUrl}:`, error)
    return undefined
  }
}

// Fetch token symbol from VanaScan API
async function fetchTokenSymbol(tokenAddress: string): Promise<string | undefined> {
  try {
    if (!tokenAddress || tokenAddress.trim() === '' || !isValidEthereumAddress(tokenAddress)) {
      return undefined
    }

    const apiUrl = `${config.vanascan.apiUrl}/api/v2/addresses/${tokenAddress.toLowerCase()}`
    log('debug', `Fetching token info from VanaScan: ${apiUrl}`)

    const response = await fetch(apiUrl)
    if (!response.ok) {
      log(
        'error',
        `Failed to fetch token info from VanaScan for ${tokenAddress}: ${response.statusText}`,
      )
      return undefined
    }

    const tokenData = (await response.json()) as VanaScanTokenResponse

    if (tokenData?.token?.symbol) {
      log('debug', `Successfully fetched token symbol: ${tokenData.token.symbol}`)
      return tokenData.token.symbol
    }

    log('debug', `No token symbol found for ${tokenAddress}`)
    return undefined
  } catch (error) {
    log('error', `Error fetching token symbol from VanaScan for ${tokenAddress}:`, error)
    return undefined
  }
}

// Upload image from URL to Sanity media library
async function uploadImageFromUrl(imageUrl: string, filename: string): Promise<any | null> {
  try {
    if (!imageUrl || imageUrl.trim() === '' || imageUrl === '-') {
      return null
    }

    // Check if URL is valid
    try {
      new URL(imageUrl.trim())
    } catch {
      log('error', `Invalid URL format: ${imageUrl}`)
      return null
    }

    log('debug', `Uploading image from URL: ${imageUrl}`)

    // Fetch the image
    const response = await fetch(imageUrl.trim())
    if (!response.ok) {
      log('error', `Failed to fetch image from ${imageUrl}: ${response.statusText}`)
      return null
    }

    // Get the image buffer
    const imageBuffer = Buffer.from(await response.arrayBuffer())

    // Upload to Sanity
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: filename,
    })

    log('info', `Successfully uploaded image: ${asset._id}`)

    // Return the image reference object for Sanity
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    }
  } catch (error) {
    log('error', `Error uploading image from ${imageUrl}:`, error)
    return null
  }
}

// Create or update a token document in Sanity
async function createOrUpdateToken(
  tokenContract: string,
  tokenSymbol: string,
  iconUrl?: string,
  description?: string,
  dataDAODocumentId?: string,
): Promise<string | null> {
  try {
    if (!tokenContract || !isValidEthereumAddress(tokenContract)) {
      return null
    }

    const tokenId = `token-${tokenContract.toLowerCase()}`

    // Check if token already exists
    const existingToken: SanityToken | null = await sanityClient.fetch(
      `*[_type == "token" && tokenContract == $tokenContract][0]`,
      {tokenContract: tokenContract.toLowerCase()},
      {perspective: 'raw'},
    )

    const tokenData: SanityTokenUpdateData = {
      tokenContract: tokenContract.toLowerCase(),
      tokenSymbol: tokenSymbol || '',
    }

    // Auto-populate tokenName from tokenSymbol if token name is empty, but preserve manual edits
    if (tokenSymbol && (!existingToken?.tokenName || existingToken.tokenName.trim() === '')) {
      tokenData.tokenName = tokenSymbol
    }

    // Upload icon from URL if available and not already set (preserving manual edits)
    if (iconUrl && iconUrl.trim() && !existingToken?.icon) {
      const iconAsset = await uploadImageFromUrl(
        iconUrl.trim(),
        `token-${tokenContract.toLowerCase()}-icon`,
      )
      if (iconAsset) {
        tokenData.icon = iconAsset
      }
    }

    // Auto-populate description from DataDAO if token description is empty, but preserve manual edits
    if (description && (!existingToken?.description || existingToken.description.trim() === '')) {
      tokenData.description = description
    }

    // Handle two-way relationship with DataDAO (1:1 relationship)
    if (dataDAODocumentId) {
      tokenData.associatedDataDAO = {
        _type: 'reference' as const,
        _ref: dataDAODocumentId,
      }
    }

    let documentId: string

    if (existingToken) {
      // Update existing token
      documentId = existingToken._id
      log('debug', `Updating existing token: ${documentId}`)
      await sanityClient.patch(documentId).set(tokenData).commit()
    } else {
      // Create new token as published (not draft) so it can be immediately referenced
      documentId = tokenId
      log('debug', `Creating new published token: ${documentId}`)

      const document = {
        _id: documentId,
        _type: 'token',
        ...tokenData,
      }

      await sanityClient.createOrReplace(document)
    }

    log('info', `Successfully processed token ${tokenSymbol} (${tokenContract})`)
    return documentId
  } catch (error: any) {
    log('error', `Failed to create/update token ${tokenContract}:`, {error: error.message})
    return null
  }
}

/**
 * TWO-TIER FIELD UPDATE SYSTEM:
 *
 * 1. AUTHORITY FIELDS (mapSubgraphAuthorityFields):
 *    - Subgraph is the source of truth
 *    - Always override manual edits
 *    - Examples: contract addresses, verification status, contributor counts, files counts
 *
 * 2. INITIAL FIELDS (mapSubgraphInitialFields):
 *    - Subgraph provides initial values
 *    - Manual edits take precedence
 *    - Examples: name, description, website, icon
 */

// Map subgraph data that should always override manual edits (source of truth: subgraph)
async function mapSubgraphAuthorityFields(
  subgraphData: ProcessedDlpInfo,
  iconUrl?: string,
  description?: string,
  dataDAODocumentId?: string,
): Promise<Partial<SanityUpdateData>> {
  const mapped: Partial<SanityUpdateData> = {}

  // Contract address - always from subgraph
  if (subgraphData.address && isValidEthereumAddress(subgraphData.address)) {
    mapped.contractAddress = subgraphData.address.toLowerCase()
  }

  // Token reference - create or update token document and reference it
  if (
    subgraphData.token &&
    subgraphData.token.trim() !== '' &&
    isValidEthereumAddress(subgraphData.token) &&
    isNonZeroAddress(subgraphData.token)
  ) {
    log('debug', `Creating token for DLP ${subgraphData.id}: ${subgraphData.token} (symbol: ${subgraphData.tokenSymbol || 'not available'})`)
    
    const tokenDocumentId = await createOrUpdateToken(
      subgraphData.token,
      subgraphData.tokenSymbol || '',
      iconUrl,
      description,
      dataDAODocumentId,
    )

    if (tokenDocumentId) {
      log('info', `Successfully created/updated token for DLP ${subgraphData.id}: ${tokenDocumentId}`)
      mapped.token = {
        _type: 'reference',
        _ref: tokenDocumentId,
      }
    } else {
      log('error', `Failed to create token for DLP ${subgraphData.id} with address ${subgraphData.token}`)
    }
  } else {
    if (subgraphData.token && subgraphData.token.trim() !== '') {
      log('debug', `Skipping token creation for DLP ${subgraphData.id}: token address ${subgraphData.token} failed validation`)
    } else {
      log('debug', `No token address found for DLP ${subgraphData.id}`)
    }
  }

  // Verification status - always from subgraph
  mapped.isVerified = subgraphData.isVerified

  // Reward eligibility - always from subgraph
  mapped.isEligibleForRewards = subgraphData.isRewardEligible

  // Contributor count - always from subgraph
  mapped.contributorCount = subgraphData.uniqueFileContributors

  // Files count - always from subgraph
  mapped.filesCount = subgraphData.totalFileContributions

  // Data schema refined URL - always from subgraph (latest refiner)
  if (subgraphData.latestSchemaDefinitionUrl) {
    mapped.dataSchemaRefined = subgraphData.latestSchemaDefinitionUrl
  }

  // Refiner ID - always from subgraph (latest refiner)
  if (subgraphData.latestRefinerId) {
    mapped.refinerId = subgraphData.latestRefinerId
  }

  // Data name - always from subgraph (refiner schema data)
  if (subgraphData.refinerSchemaData?.name) {
    mapped.dataName = subgraphData.refinerSchemaData.name
  }

  // Data description - always from subgraph (refiner schema data)
  if (subgraphData.refinerSchemaData?.description) {
    mapped.dataDescription = subgraphData.refinerSchemaData.description
  }

  return mapped
}

// Map subgraph data that should only be set initially (can be manually overridden)
async function mapSubgraphInitialFields(
  subgraphData: ProcessedDlpInfo,
  existingData?: SanityDataDAO,
): Promise<Partial<SanityUpdateData>> {
  const mapped: Partial<SanityUpdateData> = {}

  // Name - use subgraph value only if not manually set
  if (subgraphData.name && subgraphData.name.trim() && !existingData?.name) {
    mapped.name = subgraphData.name.trim()
  }

  // Website - use subgraph value only if not manually set
  if (
    subgraphData.website &&
    subgraphData.website.trim() &&
    (subgraphData.website.startsWith('http://') || subgraphData.website.startsWith('https://')) &&
    !existingData?.website
  ) {
    mapped.website = subgraphData.website.trim()
  }

  // Icon - use subgraph value only if not manually set
  if (subgraphData.iconUrl && subgraphData.iconUrl.trim() && !existingData?.icon) {
    const iconAsset = await uploadImageFromUrl(
      subgraphData.iconUrl.trim(),
      `dlp-${subgraphData.id}-icon`,
    )
    if (iconAsset) {
      mapped.icon = iconAsset
    }
  }

  // Description - use subgraph metadata, only if not manually set
  if (subgraphData.metadata && subgraphData.metadata.trim() && !existingData?.description) {
    mapped.description = subgraphData.metadata.trim()
  }

  // Frequency of contribution - initial value is unspecified
  mapped.frequencyOfContribution = 'unspecified'

  return mapped
}

// Map subgraph data to Sanity field structure
async function mapSubgraphDataToSanity(
  subgraphData: ProcessedDlpInfo,
  isNewDocument = false,
  existingData?: SanityDataDAO,
  dataDAODocumentId?: string,
): Promise<SanityUpdateData> {
  const mapped: SanityUpdateData = {}

  // Always include ID for new documents
  if (isNewDocument) {
    mapped.id = subgraphData.id
  }

  // Get initial fields first to determine description for token
  const initialFields = await mapSubgraphInitialFields(subgraphData, existingData)

  // Get authority fields (always override) - pass iconUrl, description, and DataDAO ID for token creation
  const authorityFields = await mapSubgraphAuthorityFields(
    subgraphData,
    subgraphData.iconUrl,
    initialFields.description ?? existingData?.description,
    dataDAODocumentId,
  )
  Object.assign(mapped, authorityFields)

  if (Object.keys(authorityFields).length > 0) {
    log(
      'debug',
      `Authority fields from subgraph (will override manual edits):`,
      Object.keys(authorityFields),
    )
  }

  // Apply initial fields (only if not manually set)
  Object.assign(mapped, initialFields)

  if (Object.keys(initialFields).length > 0) {
    log(
      'debug',
      `Initial fields from subgraph (only if not manually set):`,
      Object.keys(initialFields),
    )
  }

  return mapped
}

// Fetch DLP data from subgraph with pagination
async function fetchSubgraphData(): Promise<ProcessedDlpInfo[]> {
  try {
    log('info', 'Fetching DLP data from subgraph')

    const pageSize = 100 // GraphQL pagination limit
    let allDlps: any[] = []
    let skip = 0
    let hasMore = true
    let pageCount = 0

    while (hasMore) {
      pageCount++
      log('debug', `Fetching page ${pageCount} (skip: ${skip}, first: ${pageSize})`)

      const query = `
        query {
          dlps(first: ${pageSize}, skip: ${skip}, orderBy: id, orderDirection: asc) {
            name
            id
            address
            creator
            token
            owner
            treasury
            isVerified
            isRewardEligible
            createdAt
            metadata
            iconUrl
            website
            totals {
              totalFileContributions
              uniqueFileContributors
            }
            refiners {
              id
              schemaDefinitionUrl
            }
          }
        }
      `

      const response = await fetch(config.subgraph.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({query}),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SubgraphResponse = (await response.json()) as SubgraphResponse

      if (!result.data || !result.data.dlps) {
        throw new Error('Invalid response format from subgraph')
      }

      const pageDlps = result.data.dlps
      allDlps.push(...pageDlps)

      log(
        'info',
        `Page ${pageCount}: Fetched ${pageDlps.length} DLPs (total so far: ${allDlps.length})`,
      )

      // Check if we have more data to fetch
      hasMore = pageDlps.length === pageSize
      skip += pageSize

      // Add small delay between requests to be respectful to the API
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    log(
      'info',
      `Successfully fetched all ${allDlps.length} DLPs from subgraph in ${pageCount} pages`,
    )

    // Process the subgraph data
    const processedData: ProcessedDlpInfo[] = []

    for (const dlp of allDlps) {
      const refinerInfo = getLatestRefinerInfo(dlp.refiners)
      let refinerSchemaData: RefinerSchemaData | undefined
      let tokenSymbol: string | undefined

      // Fetch refiner schema data if URL is available
      if (refinerInfo.url) {
        refinerSchemaData = await fetchRefinerSchemaData(refinerInfo.url)
      }

      // Fetch token symbol if token address is available
      if (dlp.token && isValidEthereumAddress(dlp.token) && isNonZeroAddress(dlp.token)) {
        log('debug', `Fetching token symbol for DLP ${dlp.id} token: ${dlp.token}`)
        tokenSymbol = await fetchTokenSymbol(dlp.token)
        if (tokenSymbol) {
          log('debug', `Found token symbol for DLP ${dlp.id}: ${tokenSymbol}`)
        } else {
          log('debug', `No token symbol found for DLP ${dlp.id} token: ${dlp.token}`)
        }
      }

      processedData.push({
        id: parseInt(dlp.id),
        address: dlp.address,
        creator: dlp.creator,
        owner: dlp.owner,
        token: dlp.token,
        treasury: dlp.treasury,
        name: dlp.name,
        metadata: dlp.metadata,
        iconUrl: dlp.iconUrl,
        website: dlp.website,
        isVerified: dlp.isVerified,
        isRewardEligible: dlp.isRewardEligible || false,
        createdAt: dlp.createdAt,
        totalFileContributions: parseInt(dlp.totals.totalFileContributions),
        uniqueFileContributors: parseInt(dlp.totals.uniqueFileContributors),
        latestSchemaDefinitionUrl: refinerInfo.url,
        latestRefinerId: refinerInfo.id,
        refinerSchemaData: refinerSchemaData,
        tokenSymbol: tokenSymbol,
      })
    }

    log('debug', `Processed ${processedData.length} DLP records`)
    return processedData
  } catch (error: any) {
    log('error', 'Failed to fetch data from subgraph:', {error: error.message})
    throw error
  }
}

// Create a new DataDAO document in Sanity
async function createDataDAOInSanity(subgraphData: ProcessedDlpInfo): Promise<UpdateResult> {
  try {
    // Generate a unique document ID based on DLP ID
    const documentId = `drafts.dataDAO-${subgraphData.id}`

    const mappedData = await mapSubgraphDataToSanity(subgraphData, true, undefined, documentId)

    log('debug', `Creating new document ${documentId} with data:`, mappedData)

    // Create new DataDAOs as draft documents
    const document = {
      _id: documentId,
      _type: 'dataDAO',
      ...mappedData,
    }

    const result = await sanityClient.createOrReplace(document)

    log('info', `Successfully created document ${documentId} for DLP "${subgraphData.name}"`)
    return {updated: false, created: true, result}
  } catch (error: any) {
    log('error', `Failed to create document for DLP ${subgraphData.id}:`, {error: error.message})
    return {updated: false, created: false, error: error.message}
  }
}

// Update an existing DataDAO document in Sanity
async function updateDataDAOInSanity(
  documentId: string,
  subgraphData: ProcessedDlpInfo,
  existingData: SanityDataDAO,
): Promise<UpdateResult> {
  try {
    const mappedData = await mapSubgraphDataToSanity(subgraphData, false, existingData, documentId)

    if (Object.keys(mappedData).length === 0) {
      log(
        'info',
        `No updates needed for document ${documentId} (DLP ID: ${subgraphData.id}) - no data changes`,
      )
      return {updated: false, created: false, reason: 'no_changes'}
    }

    log(
      'debug',
      `Updating document ${documentId} (DLP ID: ${subgraphData.id}) with data:`,
      mappedData,
    )

    const result = await sanityClient.patch(documentId).set(mappedData).commit()

    log('info', `Successfully updated document ${documentId} (DLP ID: ${subgraphData.id})`)
    return {updated: true, created: false, result}
  } catch (error: any) {
    log('error', `Failed to update document ${documentId} (DLP ID: ${subgraphData.id}):`, {
      error: error.message,
      dlpId: subgraphData.id,
      dlpName: subgraphData.name,
      documentId: documentId,
    })
    return {updated: false, created: false, error: error.message}
  }
}

// Main update function
async function updateAllDataDAOs(): Promise<UpdateStats> {
  try {
    log('info', 'Starting DataDAO sync process...')

    // Step 1: Fetch DLP data from subgraph
    const subgraphDlps = await fetchSubgraphData()

    // Step 2: Fetch existing DataDAO documents from Sanity (both drafts and published)
    // Use raw perspective to get actual document IDs (including drafts. prefix)
    const existingDataDAOs: SanityDataDAO[] = await sanityClient.fetch(
      `
      *[_type == "dataDAO" && defined(id)] {
        _id,
        id,
        name,
        contractAddress,
        website,
        description,
        icon,
        token,
        contributorCount,
        filesCount,
        isVerified,
        isEligibleForRewards,
        dataSchemaRefined,
        refinerId,
        dataName,
        dataDescription
      }
    `,
      {},
      {perspective: 'raw'},
    )

    log(
      'debug',
      `Fetched ${existingDataDAOs.length} existing documents:`,
      existingDataDAOs.map((d) => ({id: d.id, _id: d._id, name: d.name})),
    )

    // Create a map for quick lookup
    const existingDataDAOMap = new Map<number, SanityDataDAO>()
    existingDataDAOs.forEach((dao) => {
      if (dao.id) {
        existingDataDAOMap.set(dao.id, dao)
      }
    })

    log('info', `Found ${existingDataDAOs.length} existing DataDAO documents in Sanity`)

    const results: UpdateStats = {
      processed: 0,
      updated: 0,
      created: 0,
      errors: 0,
      skipped: 0,
    }

    // Step 3: Process each DLP from subgraph
    for (const subgraphDlp of subgraphDlps) {
      try {
        results.processed++

        log(
          'info',
          `Processing DLP ID: ${subgraphDlp.id} (${results.processed}/${subgraphDlps.length})`,
        )

        // Check if this is a valid DLP (has a name and is not empty)
        if (!subgraphDlp.name || subgraphDlp.name.trim() === '') {
          log('info', `Skipping DLP ID ${subgraphDlp.id} - appears to be empty or invalid`)
          results.skipped++
          continue
        }

        // Check if this DLP already exists in Sanity
        const existingDataDAO = existingDataDAOMap.get(subgraphDlp.id)

        if (existingDataDAO) {
          // Update existing document using its actual Sanity document ID
          log(
            'debug',
            `Found existing DataDAO for DLP ${subgraphDlp.id}: "${existingDataDAO.name}" (Document ID: ${existingDataDAO._id})`,
          )
          const updateResult = await updateDataDAOInSanity(
            existingDataDAO._id,
            subgraphDlp,
            existingDataDAO,
          )

          if (updateResult.updated) {
            results.updated++
          } else if (updateResult.error) {
            results.errors++
          }
        } else {
          // Create new document
          log('debug', `Creating new DataDAO for DLP ${subgraphDlp.id}: "${subgraphDlp.name}"`)
          const createResult = await createDataDAOInSanity(subgraphDlp)

          if (createResult.created) {
            results.created++
          } else if (createResult.error) {
            results.errors++
          }
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error: any) {
        log('error', `Error processing DLP ID ${subgraphDlp.id}:`, {error: error.message})
        results.errors++
      }
    }

    log('info', 'DataDAO sync process completed', results)
    log(
      'info',
      `Summary: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`,
    )
    return results
  } catch (error: any) {
    log('error', 'Fatal error in sync process:', {error: error.message})
    throw error
  }
}

// Test connection function
async function testConnections(): Promise<boolean> {
  try {
    log('info', 'Testing connections...')

    // Test Sanity connection
    const sanityProjects = await sanityClient.projects.list()
    log('info', 'Sanity connection: OK')

    // Test subgraph connection
    const testResponse = await fetch(config.subgraph.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'query { dlps(first: 1) { id name } }',
      }),
    })

    if (!testResponse.ok) {
      throw new Error(`Subgraph test failed: ${testResponse.status}`)
    }

    const testResult = (await testResponse.json()) as any
    log('info', 'Subgraph connection: OK', {sampleData: testResult.data?.dlps?.[0]})

    return true
  } catch (error: any) {
    log('error', 'Connection test failed:', {error: error.message})
    return false
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    // Validate environment variables
    if (!config.sanity.projectId || !config.sanity.token) {
      throw new Error('Missing required environment variables. Check your .env file.')
    }

    // Test connections first
    const connectionsOk = await testConnections()
    if (!connectionsOk) {
      throw new Error('Connection tests failed')
    }

    // Run the update process
    const results = await updateAllDataDAOs()

    log('info', 'Update process completed successfully', results)
    process.exit(0)
  } catch (error: any) {
    log('error', 'Update process failed:', {error: error.message})
    process.exit(1)
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
