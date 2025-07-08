/**
 * IPFS utility functions for handling IPFS URLs and gateway fallbacks
 */

/**
 * Extracts IPFS hash from various gateway URL formats
 * @param url - IPFS gateway URL
 * @returns IPFS hash or null if not found
 */
export function extractIPFSHash(url: string): string | null {
  try {
    // Common IPFS gateway patterns
    const patterns = [
      // https://gateway.com/ipfs/QmHash
      /\/ipfs\/([a-zA-Z0-9]+)/,
      // ipfs://QmHash
      /^ipfs:\/\/([a-zA-Z0-9]+)/,
      // https://QmHash.ipfs.gateway.com/
      /^https?:\/\/([a-zA-Z0-9]+)\.ipfs\./,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting IPFS hash:', error)
    return null
  }
}

/**
 * Returns an array of IPFS gateway URLs for a given hash
 * @param hash - IPFS hash
 * @returns Array of gateway URLs to try
 */
export function getIPFSGateways(hash: string): string[] {
  return [
    `https://ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
  ]
}

/**
 * Fetches content from IPFS with automatic gateway fallback
 * @param url - Initial IPFS URL
 * @param options - Fetch options
 * @returns Response from the first successful gateway
 */
export async function fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
  // Try the original URL first
  const urlsToTry = [url]

  // Extract IPFS hash and add fallback gateways
  const hash = extractIPFSHash(url)
  if (hash) {
    const gateways = getIPFSGateways(hash)
    // Add gateways that aren't already in the list
    for (const gateway of gateways) {
      if (!urlsToTry.includes(gateway)) {
        urlsToTry.push(gateway)
      }
    }
  }

  console.log(`Attempting to fetch IPFS content from ${urlsToTry.length} gateway(s)`)

  const errors: Array<{url: string; error: string}> = []

  for (let i = 0; i < urlsToTry.length; i++) {
    const gatewayUrl = urlsToTry[i]
    try {
      console.log(`Trying gateway ${i + 1}/${urlsToTry.length}: ${gatewayUrl}`)

      const response = await fetch(gatewayUrl, {
        ...options,
        // Add timeout to prevent hanging on unresponsive gateways
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (response.ok) {
        console.log(`Successfully fetched from: ${gatewayUrl}`)
        return response
      } else {
        const error = `HTTP ${response.status}: ${response.statusText}`
        console.warn(`Gateway failed: ${gatewayUrl} - ${error}`)
        errors.push({url: gatewayUrl, error})
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(`Gateway failed: ${gatewayUrl} - ${errorMessage}`)
      errors.push({url: gatewayUrl, error: errorMessage})
    }
  }

  // All gateways failed, throw detailed error
  const errorDetails = errors.map((e) => `  - ${e.url}: ${e.error}`).join('\n')

  throw new Error(
    `Failed to fetch from all IPFS gateways:\n${errorDetails}\n\nOriginal URL: ${url}`,
  )
}
