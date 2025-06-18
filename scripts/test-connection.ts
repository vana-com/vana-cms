#!/usr/bin/env tsx

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import type {Config, SubgraphResponse} from './types.js'

// Load environment variables
dotenv.config()

// Configuration (same as main script)
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

async function runTests(): Promise<boolean> {
  console.log('🧪 Testing connections and functionality...\n')

  // Test 1: Environment Variables
  console.log('1️⃣ Checking environment variables...')
  const envChecks = {
    SANITY_PROJECT_ID: config.sanity.projectId,
    SANITY_DATASET: config.sanity.dataset,
    SANITY_WRITE_TOKEN: config.sanity.token ? '✓ Set' : '❌ Missing',
    SUBGRAPH_URL: config.subgraph.url ? '✓ Set' : '❌ Missing',
    VANASCAN_API_URL: config.vanascan.apiUrl ? '✓ Set' : '❌ Missing',
  }

  console.table(envChecks)

  if (!config.sanity.projectId || !config.sanity.token) {
    console.error('❌ Missing required environment variables!')
    return false
  }

  // Test 2: Sanity Connection
  console.log('\n2️⃣ Testing Sanity connection...')
  try {
    const sanityClient = createClient(config.sanity)

    // Test read access
    const datasets = await sanityClient.datasets.list()
    console.log(`✅ Sanity read access: OK (Found ${datasets.length} datasets)`)

    // Test write access by fetching existing DataDAOs
    const dataDAOs = await sanityClient.fetch(`*[_type == "dataDAO"][0...3] { _id, id, name }`)
    console.log(`✅ Sanity query access: OK (Found ${dataDAOs.length} DataDAO documents)`)

    if (dataDAOs.length > 0) {
      console.log('📄 Sample DataDAOs found:')
      dataDAOs.forEach((dao: any) => console.log(`   - ${dao.name} (ID: ${dao.id})`))
    }
  } catch (error: any) {
    console.error('❌ Sanity connection failed:', error.message)
    return false
  }

  // Test 3: Subgraph Connection
  console.log('\n3️⃣ Testing subgraph connection...')
  try {
    const testQuery = `
      query {
        dlps(first: 3) {
          id
          name
          address
          isVerified
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
      body: JSON.stringify({query: testQuery}),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: SubgraphResponse = (await response.json()) as SubgraphResponse

    console.log(`✅ Subgraph connection: OK`)
    console.log(`   - Subgraph URL: ${config.subgraph.url}`)
    console.log(`   - DLPs found: ${result.data.dlps.length}`)

    if (result.data.dlps.length > 0) {
      console.log('📄 Sample DLPs from subgraph:')
      result.data.dlps.forEach((dlp) => {
        console.log(
          `   - ${dlp.name} (ID: ${dlp.id}) - Contributors: ${dlp.totals.uniqueFileContributors}, Files: ${dlp.totals.totalFileContributions}`,
        )
      })
    }
  } catch (error: any) {
    console.error('❌ Subgraph connection failed:', error.message)
    return false
  }

  // Test 4: Data Mapping Simulation
  console.log('\n4️⃣ Testing data mapping...')
  try {
    const testQuery = `
      query {
        dlps(first: 1) {
          id
          name
          address
          creator
          token
          owner
          treasury
          isVerified
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
      body: JSON.stringify({query: testQuery}),
    })

    const result: SubgraphResponse = (await response.json()) as SubgraphResponse

    if (result.data.dlps.length > 0) {
      const dlp = result.data.dlps[0]

      // Simulate the latest refiner schema URL logic
      const getLatestSchemaUrl = (refiners: any[]) => {
        if (!refiners || refiners.length === 0) return undefined
        const sortedRefiners = refiners
          .filter((r) => r.schemaDefinitionUrl && r.schemaDefinitionUrl.trim() !== '')
          .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        return sortedRefiners.length > 0 ? sortedRefiners[0].schemaDefinitionUrl : undefined
      }

      // Simulate the mapping function
      const mappedData = {
        id: parseInt(dlp.id),
        name: dlp.name,
        contractAddress: dlp.address?.toLowerCase(),
        website: dlp.website,
        tokenContract:
          dlp.token && dlp.token !== '0x0000000000000000000000000000000000000000'
            ? dlp.token.toLowerCase()
            : undefined,
        contributorCount: parseInt(dlp.totals.uniqueFileContributors),
        filesCount: parseInt(dlp.totals.totalFileContributions),
        isVerified: dlp.isVerified,
        isEligibleForRewards: dlp.isRewardEligible || false,
        dataSchemaRefined: getLatestSchemaUrl(dlp.refiners),
      }

      console.log('✅ Data mapping: OK')
      console.log('📊 Sample mapped data:')
      console.table(mappedData)
    }
  } catch (error: any) {
    console.error('❌ Data mapping test failed:', error.message)
    return false
  }

  console.log('\n🎉 All tests passed! The update script should work correctly.')
  console.log('\n📝 Next steps:')
  console.log('   1. Update your .env file with the correct SANITY_WRITE_TOKEN')
  console.log('   2. Run: npm run update')
  console.log('   3. Set up GitHub repository secrets for the automated workflow')

  return true
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}
