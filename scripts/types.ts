// Type definitions for the DataDAO updater

export interface SubgraphDlpTotals {
  totalFileContributions: string
  uniqueFileContributors: string
}

export interface SubgraphRefiner {
  id: string
  schemaDefinitionUrl: string
}

export interface SubgraphDlp {
  name: string
  id: string
  address: string
  creator: string
  token: string
  owner: string
  treasury: string
  verificationBlockNumber: string | null
  createdAt: string
  metadata: string
  iconUrl: string
  website: string
  totals: SubgraphDlpTotals
  refiners: SubgraphRefiner[]
}

export interface SubgraphResponse {
  data: {
    dlps: SubgraphDlp[]
  }
}

export interface RefinerSchemaData {
  name: string
  version: string
  description: string
  dialect: string
  schema: string
}

export interface VanaScanTokenResponse {
  token: {
    symbol: string
    name: string
  }
}

export interface ProcessedDlpInfo {
  id: number
  address: string
  creator: string
  owner: string
  token: string
  treasury: string
  name: string
  metadata: string
  iconUrl: string
  website: string
  isVerified: boolean
  isRewardEligible: boolean
  createdAt: string
  totalFileContributions: number
  uniqueFileContributors: number
  latestSchemaDefinitionUrl?: string
  latestRefinerId?: number
  refinerSchemaData?: RefinerSchemaData
  tokenSymbol?: string
}

export interface SanityToken {
  _id: string
  tokenContract: string
  tokenSymbol: string
  tokenName?: string
  icon?: any
  description?: string
  associatedDataDAO?: {_ref: string, _type: 'reference'}
}

export interface SanityDataDAO {
  _id: string
  id: number
  name?: string
  contractAddress?: string
  website?: string
  description?: string
  icon?: any
  token?: {_ref: string, _type: 'reference'}
  contributorCount?: number
  filesCount?: number
  isVerified?: boolean
  isEligibleForRewards?: boolean
  dataSchemaRefined?: string
  refinerId?: number
  dataName?: string
  dataDescription?: string
}

export interface SanityTokenUpdateData {
  tokenContract?: string
  tokenSymbol?: string
  tokenName?: string
  icon?: any
  description?: string
  associatedDataDAO?: {_ref: string, _type: 'reference'}
}

export interface SanityUpdateData {
  id?: number
  name?: string
  contractAddress?: string
  website?: string
  description?: string
  icon?: any
  token?: {_ref: string, _type: 'reference'}
  contributorCount?: number
  filesCount?: number
  isVerified?: boolean
  isEligibleForRewards?: boolean
  dataSchemaRefined?: string
  refinerId?: number
  dataName?: string
  dataDescription?: string
  frequencyOfContribution?: string
}

export interface UpdateResult {
  updated: boolean
  created: boolean
  result?: any
  error?: string
  reason?: string
}

export interface UpdateStats {
  processed: number
  updated: number
  created: number
  errors: number
  skipped: number
}

export interface Config {
  sanity: {
    projectId: string
    dataset: string
    token: string
    apiVersion: string
    useCdn: boolean
  }
  subgraph: {
    url: string
  }
  vanascan: {
    apiUrl: string
  }
}
